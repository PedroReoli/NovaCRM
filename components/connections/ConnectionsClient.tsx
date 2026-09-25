"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import type { ChannelRoutingSettings } from "@/lib/routing/channel-policies";
import { copyToClipboard } from "@/lib/clipboard";
import { randomId } from "@/lib/random-id";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import {
  channelLabel,
  useChannelSessions,
  type ChannelSession,
} from "@/hooks/channels/useChannelSessions";
import { CHANNEL_PROVIDER_SOCIAL } from "@/lib/channels/capabilities";
import { usePacingKnobs } from "@/hooks/channels/usePacingKnobs";
import { useTagDeIdioma } from "@/hooks/i18n/useLocaleDeData";
import { useT } from "@/hooks/i18n/useT";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowsClockwise, CircleNotch, Phone, Plus, Warning } from "@/lib/ui/icons";
import { AntiBanSheet } from "./AntiBanSheet";
import { ParaIntegrar } from "./ParaIntegrar";
import { ChannelCard } from "./ChannelCard";
import { ExcluirCanalDialog, frasesDoImpacto } from "./ExcluirCanalDialog";
import { QrDialog } from "./QrDialog";
import { errMsg } from "./helpers";

export { frasesDoImpacto };

export function ConnectionsClient({ wahaConfigured }: { wahaConfigured: boolean }) {
  const tagDoIdioma = useTagDeIdioma();
  const t = useT();
  const qc = useQueryClient();
  const {
    data: sessions,
    isLoading,
    isError,
    schemaOutdated,
  } = useChannelSessions({ refetchInterval: 10_000 });
  const [busyId, setBusyId] = useState<string | null>(null);
  const createKey = useRef<string | null>(null);
  const [connectionDetail, setConnectionDetail] = useState<string | null>(null);
  const routing = useQuery({
    queryKey: ["channel-routing-settings"],
    queryFn: () => apiClient.get<{ data: ChannelRoutingSettings }>("/api/v1/settings/routing/channels"),
  });
  const [creating, setCreating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [qr, setQr] = useState<{ sessionId: string; title: string } | null>(null);
  const [antiBanId, setAntiBanId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ChannelSession | null>(null);
  const pacingItems = usePacingKnobs().data?.items ?? [];

  const invalidate = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ["channel-sessions"] });
    void qc.invalidateQueries({ queryKey: ["pacing-knobs"] });
  }, [qc]);

  const runHealthCheck = useCallback(
    async (list: ChannelSession[]) => {
      if (!wahaConfigured || list.length === 0) return;
      setChecking(true);
      try {
        await Promise.allSettled(
          list.map((c) => apiClient.get(`/api/v1/channel-sessions/${c.id}`)),
        );
        invalidate();
      } finally {
        setChecking(false);
      }
    },
    [wahaConfigured, invalidate],
  );

  const didInitialCheck = useRef(false);
  useEffect(() => {
    if (didInitialCheck.current || !sessions || sessions.length === 0) return;
    didInitialCheck.current = true;
    void runHealthCheck(sessions);
  }, [sessions, runHealthCheck]);

  const handleConnectNew = useCallback(async () => {
    setCreating(true);
    setConnectionDetail(null);
    try {
      const res = await apiClient.post<{ data: ChannelSession }>(
        "/api/v1/channel-sessions",
        {},
        { idempotencyKey: createKey.current ??= randomId(), timeoutMs: 120_000 },
      );
      invalidate();
      createKey.current = null;
      setQr({ sessionId: res.data.id, title: t("Conectar novo WhatsApp") });
    } catch (err) {
      toast.error(errMsg(err, "Não foi possível iniciar a conexão.", t));
      if (err instanceof ApiError) {
        setConnectionDetail(
          JSON.stringify(
            { code: err.code, request_id: err.requestId, ...err.details },
            null,
            2,
          ),
        );
      }
      invalidate();
    } finally {
      setCreating(false);
    }
  }, [invalidate, t]);

  const handleReconnect = useCallback(
    async (c: ChannelSession) => {
      setBusyId(c.id);
      try {
        await apiClient.post(`/api/v1/channel-sessions/${c.id}/reconnect`, {});
        invalidate();
        setQr({ sessionId: c.id, title: `${t("Reconectar")} ${channelLabel(c, t)}` });
      } catch (err) {
        toast.error(errMsg(err, "Não foi possível reconectar.", t));
      } finally {
        setBusyId(null);
      }
    },
    [invalidate, t],
  );

  const forcePair = useCallback(
    async (sessionId: string) => {
      await apiClient.post(`/api/v1/channel-sessions/${sessionId}/reconnect`, { force: true });
      invalidate();
    },
    [invalidate],
  );

  const handleDeleted = useCallback(() => {
    setToDelete(null);
    invalidate();
  }, [invalidate]);

  const handleConnected = useCallback(() => {
    toast.success(t("WhatsApp conectado!"));
    setQr(null);
    invalidate();
  }, [invalidate, t]);

  const list = (sessions ?? []).filter((session) => session.provider !== CHANNEL_PROVIDER_SOCIAL);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {isError
            ? t("Não foi possível carregar seus números.")
            : list.length === 0
              ? t("Nenhum número conectado ainda.")
              : `${list.length} ${list.length === 1 ? t("número conectado") : t("números conectados")}.`}
        </p>
        <div className="flex gap-2">
          {list.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={checking || !wahaConfigured}
              onClick={() => void runHealthCheck(list)}
            >
              <ArrowsClockwise
                size={14}
                className={checking ? "animate-spin" : undefined}
                aria-hidden
              />
              {t("Atualizar saúde")}
            </Button>
          )}
          <Button size="sm" disabled={creating || !wahaConfigured} onClick={handleConnectNew}>
            {creating ? (
              <CircleNotch size={14} className="animate-spin" aria-hidden />
            ) : (
              <Plus size={14} aria-hidden />
            )}
            {t("Conectar novo WhatsApp")}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {t(
          "Novos canais começam em modo de teste, sem respostas automáticas até você autorizar números ou liberar o público.",
        )}
      </p>

      {list.length > 0 ? (
        <ParaIntegrar
          campos={[]}
          ajuda={
            <div className="space-y-1.5">
              <p>
                {t(
                  "No canal por QR a credencial é interna desta instalação e não serve para fora. Para ligar outro CRM ao mesmo número, conecte-o por uma sessão própria (novo QR).",
                )}
              </p>
              <p>
                {t(
                  "Dois dispositivos vinculados recebem as mesmas mensagens — se os dois tiverem atendimento automático, o cliente pode receber resposta dupla.",
                )}
              </p>
            </div>
          }
          aviso={
            <>
              {t("Não compartilhe esta sessão.")}{" "}
              {t("Crie uma conexão separada por QR no outro sistema.")}
            </>
          }
        />
      ) : null}

      {connectionDetail && (
        <details className="rounded-md border p-3 text-sm">
          <summary>{t("Detalhes para suporte")}</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words">{connectionDetail}</pre>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (await copyToClipboard(connectionDetail)) toast.success(t("Copiado!"));
              else toast.error(t("Não foi possível copiar. Selecione e copie manualmente."));
            }}
          >
            {t("Copiar detalhes")}
          </Button>
        </details>
      )}

      <Link href="/app/settings/atendimento" className="text-sm underline">
        {t("Configurar responsáveis por número")}
      </Link>

      {!wahaConfigured && (
        <div className="rounded-md border border-warning bg-warning-bg p-4 text-sm text-warning-fg">
          <p className="font-medium">{t("O serviço do WhatsApp não está configurado.")}</p>
          <p className="mt-1">
            {t("Faltam o endereço e a chave do serviço (")}
            <code>WAHA_API_BASE_URL</code> {t("e")} <code>WAHA_API_KEY</code>
            {t(
              ") nas variáveis de ambiente desta instalação. Enquanto isso, não dá para conectar, reconectar nem excluir os números pareados por QR — excluir um número também o desconecta do aparelho, e sem o serviço isso não acontece.",
            )}
          </p>
          <p className="mt-1">
            {t("Se você roda tudo na mesma máquina, o container sobe com")}{" "}
            <code>docker compose up -d waha</code>
            {t(
              ". Já apareceu aqui o caso oposto: o container no ar e o endereço configurado apontando para um lugar que não existe — subir o container de novo não conserta isso.",
            )}
          </p>
        </div>
      )}

      {schemaOutdated && (
        <div className="rounded-md border border-warning bg-warning-bg p-4 text-sm text-warning-fg">
          <p className="font-medium">{t("Esta instalação está com o banco atrasado.")}</p>
          <p className="mt-1">
            {t(
              "Falta aplicar a migration que registra canal excluído. Até lá, um número que você excluir continua aparecendo nesta lista.",
            )}
          </p>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("Carregando conexões…")}</p>
      ) : isError ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <Warning size={28} className="text-error-fg" aria-hidden />
          <p className="text-sm text-error-fg">
            {t(
              "Não foi possível carregar seus números — esta lista não está mostrando o que existe.",
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(
              "Não conecte um número novo por causa disto: recarregue a página. Se persistir, o servidor do sistema está fora do ar.",
            )}
          </p>
        </Card>
      ) : list.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <Phone size={28} className="text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            {t("Conecte seu primeiro número de WhatsApp para começar a atender.")}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <ChannelCard
              key={c.id}
              channel={c}
              policyMode={
                routing.data?.data?.channels?.find((channel) => channel.id === c.id)?.mode
              }
              wahaConfigured={wahaConfigured}
              busyId={busyId}
              tagDoIdioma={tagDoIdioma}
              onReconnect={handleReconnect}
              onOpenAntiBan={setAntiBanId}
              onSelectToDelete={setToDelete}
            />
          ))}
        </div>
      )}

      {antiBanId !== null && (
        <AntiBanSheet
          item={pacingItems.find((i) => i.channel_session.id === antiBanId) ?? null}
          canWrite
          onClose={() => setAntiBanId(null)}
        />
      )}

      {toDelete && (
        <ExcluirCanalDialog
          canal={toDelete}
          onCancel={() => setToDelete(null)}
          onDeleted={handleDeleted}
        />
      )}

      {qr && (
        <QrDialog
          sessionId={qr.sessionId}
          title={qr.title}
          wahaConfigured={wahaConfigured}
          onClose={() => setQr(null)}
          onConnected={handleConnected}
          onForcePair={forcePair}
        />
      )}
    </div>
  );
}
