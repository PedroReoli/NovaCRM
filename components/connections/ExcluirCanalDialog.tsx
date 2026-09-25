import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { channelLabel, type ChannelSession } from "@/hooks/channels/useChannelSessions";
import type { ChannelDeletionImpact } from "@/app/api/v1/channel-sessions/[id]/route";
import { useT } from "@/hooks/i18n/useT";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CircleNotch, Trash } from "@/lib/ui/icons";
import { contar, enumerar, errMsg } from "./helpers";

export function frasesDoImpacto(
  impact: ChannelDeletionImpact,
  t: (texto: string) => string = (texto) => texto,
): string[] {
  if (impact.outcome === "delete") {
    return [t("Este número não tem conversa, mensagem nem configuração ligada a ele.")];
  }

  const noInbox = enumerar(
    [
      contar(impact.history.conversations, "conversa", "conversas", t),
      contar(impact.history.messages, "mensagem", "mensagens", t),
      contar(impact.history.voice_calls, "chamada de voz", "chamadas de voz", t),
    ],
    t,
  );
  const semNumero = enumerar(
    [
      contar(impact.history.agent_versions, "versão de agente", "versões de agente", t),
      contar(impact.configuration.ai_routers, "roteador de IA", "roteadores de IA", t),
      contar(
        impact.configuration.channel_knobs,
        "ajuste de proteção de envio",
        "ajustes de proteção de envio",
        t,
      ),
    ],
    t,
  );

  const frases: string[] = [];
  if (noInbox) frases.push(`${t("Continua no inbox:")} ${noInbox}.`);
  if (semNumero)
    frases.push(`${t("Fica salvo, mas sem número — para de atender:")} ${semNumero}.`);
  if (frases.length === 0) {
    frases.push(
      t("Este canal tem registros internos, por isso ele é arquivado em vez de apagado."),
    );
  }
  return frases;
}

export function ExcluirCanalDialog({
  canal,
  onCancel,
  onDeleted,
}: {
  canal: ChannelSession;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const t = useT();
  const [excluindo, setExcluindo] = useState(false);
  const {
    data: impact,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["channel-deletion-impact", canal.id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { deletion_impact?: ChannelDeletionImpact } }>(
        `/api/v1/channel-sessions/${canal.id}?impact=1`,
      );
      return res.data.deletion_impact ?? null;
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const excluir = async () => {
    setExcluindo(true);
    try {
      const res = await apiClient.delete<{
        data: { id: string; archived: boolean; impact: ChannelDeletionImpact };
      }>(`/api/v1/channel-sessions/${canal.id}`);
      const conversas = res.data.impact.history.conversations;
      toast.success(
        !res.data.archived
          ? t("Canal excluído.")
          : conversas > 0
            ? `${t("Canal removido.")} ${contar(conversas, "conversa continua", "conversas continuam", t)} ${t("no inbox.")}`
            : t("Canal removido. O que estava ligado a ele continua guardado."),
      );
      onDeleted();
    } catch (err) {
      toast.error(errMsg(err, "Não foi possível excluir o canal.", t));
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !excluindo && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("Excluir")} {channelLabel(canal, t)}?
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p>{t("O número será desconectado do WhatsApp e sai desta lista.")}</p>
              {isPending ? (
                <p>{t("Verificando o que está ligado a este número…")}</p>
              ) : isError || !impact ? (
                <p>
                  {t(
                    "Não foi possível verificar o que está ligado a este número. A exclusão continua possível — quem decide apagar ou arquivar é o servidor, e ele preserva o histórico quando existe.",
                  )}
                </p>
              ) : (
                <ul className="list-disc space-y-1 pl-5">
                  {frasesDoImpacto(impact, t).map((frase) => (
                    <li key={frase}>{frase}</li>
                  ))}
                </ul>
              )}
              <p>{t("Para usar este número de novo, será preciso conectá-lo outra vez.")}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" disabled={excluindo} onClick={onCancel}>
            {t("Cancelar")}
          </Button>
          <Button variant="destructive" disabled={excluindo || isPending} onClick={excluir}>
            {excluindo ? (
              <CircleNotch size={14} className="animate-spin" aria-hidden />
            ) : (
              <Trash size={14} aria-hidden />
            )}
            {t("Excluir")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
