import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "@/lib/ui/icons";
import { useT } from "@/hooks/i18n/useT";
import { rotuloDoEstadoDoCanal } from "@/lib/channels/estado";
import type { SelectableChannel as ChannelSessionLite } from "@/lib/channels/selectable";

interface AgentChannelCardProps {
  channelSessionId: string;
  channelSessions: ChannelSessionLite[];
  routerMembership?: { routerId: string; routerName: string } | null;
  disabled: boolean;
  onPatch: (patch: { channel_session_id: string }) => void;
}

export function AgentChannelCard({
  channelSessionId,
  channelSessions,
  routerMembership,
  disabled,
  onPatch,
}: AgentChannelCardProps) {
  const t = useT();

  return (
    <Card className="space-y-3 p-4">
      <h3 className="text-sm font-medium">{t("Por qual número ele atende")}</h3>
      {routerMembership && (
        <div className="flex items-start gap-2 rounded-md bg-accent-soft p-3 text-xs text-text-muted">
          <Info className="mt-0.5 shrink-0" aria-hidden />
          <p>
            {t("Este agente é acionado pelo roteador")}{" "}
            <Link
              href={`/app/ai/routers/${routerMembership.routerId}`}
              className="font-medium underline underline-offset-2"
            >
              «{routerMembership.routerName}»
            </Link>{" "}
            {t("— o campo de número abaixo não se aplica.")}
          </p>
        </div>
      )}
      <div className="space-y-1">
        <Label htmlFor="channel_session_id">{t("Número conectado")}</Label>
        <Select
          value={channelSessionId || undefined}
          onValueChange={(v) => onPatch({ channel_session_id: v })}
          disabled={disabled}
        >
          <SelectTrigger id="channel_session_id">
            <SelectValue placeholder={t("Selecione um número")} />
          </SelectTrigger>
          <SelectContent>
            {channelSessions.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.display_name}
                {s.phone_number ? ` · ${s.phone_number}` : ""} ·{" "}
                {rotuloDoEstadoDoCanal(s.status, t)}
              </SelectItem>
            ))}
            {channelSessions.length === 0 ? (
              <SelectItem value="__none__" disabled>
                {t("Nenhum número conectado")}
              </SelectItem>
            ) : null}
          </SelectContent>
        </Select>
        {!channelSessionId ? (
          <p className="text-xs text-muted-foreground">
            {channelSessions.length === 0 ? (
              <>
                {t("Nenhum número conectado ainda — o rascunho salva sem ele.")}{" "}
                <Link
                  href="/app/connections"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  {t("Conectar WhatsApp")}
                </Link>{" "}
                {t("para poder publicar.")}
              </>
            ) : (
              t("Escolha o número para poder publicar. Sem ele, o rascunho salva mas não atende.")
            )}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
