import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { channelLabel, type ChannelSession } from "@/hooks/channels/useChannelSessions";
import { useT } from "@/hooks/i18n/useT";
import { ArrowsClockwise, CircleNotch, Phone, ShieldCheck, Trash } from "@/lib/ui/icons";
import { ChannelAiAccess } from "./ChannelAiAccess";
import { dependeDoTransporte, ehCanalOficial, statusInfo } from "./helpers";

interface ChannelCardProps {
  channel: ChannelSession;
  policyMode?: string;
  wahaConfigured: boolean;
  busyId: string | null;
  tagDoIdioma: string;
  onReconnect: (c: ChannelSession) => void;
  onOpenAntiBan: (id: string) => void;
  onSelectToDelete: (c: ChannelSession) => void;
}

export function ChannelCard({
  channel: c,
  policyMode,
  wahaConfigured,
  busyId,
  tagDoIdioma,
  onReconnect,
  onOpenAntiBan,
  onSelectToDelete,
}: ChannelCardProps) {
  const t = useT();
  const info = statusInfo(c.status, t);
  const vivaNoTransporte = dependeDoTransporte(c);
  const podeExcluir = wahaConfigured || !vivaNoTransporte;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-muted-foreground" aria-hidden />
            <span className="truncate text-sm font-medium">{channelLabel(c, t)}</span>
            {ehCanalOficial(c) && (
              <Badge variant="default" className="shrink-0">
                {t("API oficial")}
              </Badge>
            )}
          </div>
          {c.phone_number && c.display_name && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{c.phone_number}</p>
          )}
        </div>
        <Badge variant={info.variant}>{info.label}</Badge>
      </div>

      <p className="text-[11px] text-muted-foreground">
        {c.last_health_check_at
          ? `${t("Verificado")} ${new Date(c.last_health_check_at).toLocaleString(tagDoIdioma)}`
          : t("Ainda não verificado")}
      </p>

      <ChannelAiAccess channelId={c.id} />

      <p className="text-xs text-muted-foreground">
        {t(
          !policyMode
            ? "Consulte os responsáveis em Atendimento."
            : policyMode === "legacy_unconfigured"
              ? "Usa todos os atendentes elegíveis da organização."
              : policyMode === "restricted_empty"
                ? "Ninguém configurado — as conversas ficarão na fila."
                : "Somente as pessoas selecionadas recebem este número.",
        )}
      </p>

      <div className="mt-auto flex flex-wrap gap-2">
        {vivaNoTransporte && (
          <Button
            variant="outline"
            size="sm"
            disabled={busyId === c.id || !wahaConfigured}
            onClick={() => onReconnect(c)}
          >
            {busyId === c.id ? (
              <CircleNotch size={14} className="animate-spin" aria-hidden />
            ) : (
              <ArrowsClockwise size={14} aria-hidden />
            )}
            {t("Reconectar")}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onOpenAntiBan(c.id)}>
          <ShieldCheck size={14} aria-hidden />
          {t("Proteção de envio")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!podeExcluir}
          aria-label={
            podeExcluir
              ? `${t("Excluir")} ${channelLabel(c, t)}`
              : `${t("Excluir")} ${channelLabel(c, t)} — ${t("indisponível enquanto o serviço do WhatsApp não estiver ativo")}`
          }
          onClick={() => onSelectToDelete(c)}
        >
          <Trash size={14} aria-hidden />
        </Button>
      </div>
    </Card>
  );
}
