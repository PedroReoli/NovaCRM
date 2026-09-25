import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";
import type { Campaign, Candidate } from "./_types";
import { labels } from "./_types";

interface CampaignOverviewCardProps {
  campaign: Campaign;
  candidates: Candidate[];
  busy: boolean;
  onPerform: (body: unknown, message: string) => Promise<boolean>;
}

export function CampaignOverviewCard({
  campaign,
  candidates,
  busy,
  onPerform,
}: CampaignOverviewCardProps) {
  const t = useT();

  const count = (states: string[]) => candidates.filter((c) => states.includes(c.progress)).length;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{campaign.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(labels[campaign.search_status] ?? campaign.search_status)}
            {campaign.cost_usd !== null
              ? ` · US$ ${Number(campaign.cost_usd).toFixed(2)}`
              : ""}
          </p>
        </div>
        <Badge variant="outline">{t(labels[campaign.status] ?? campaign.status)}</Badge>
      </div>

      {campaign.error && (
        <p role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {campaign.error}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          [t("Encontrados"), candidates.length],
          [t("Na fila"), count(["queued", "sending"])],
          [t("Responderam"), count(["replied", "qualified"])],
          [t("Qualificados"), count(["qualified"])],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {campaign.skipped_count > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {campaign.skipped_count}{" "}
          {t("resultados repetidos ou indisponíveis foram desconsiderados.")}
        </p>
      )}

      {campaign.config && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {t("Ritmo:")} {campaign.config.daily_limit}{" "}
            {t("abordagens em 24 horas, com pelo menos")}{" "}
            {campaign.config.interval_minutes} {t("minutos entre elas.")}
          </p>
          {campaign.status === "running" ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                void onPerform(
                  { action: "pause", id: campaign.id },
                  t("Novas abordagens pausadas."),
                )
              }
            >
              {t("Pausar abordagens")}
            </Button>
          ) : campaign.status === "paused" ? (
            <Button
              disabled={busy}
              onClick={() =>
                void onPerform({ action: "resume", id: campaign.id }, t("Campanha retomada."))
              }
            >
              {t("Retomar fila")}
            </Button>
          ) : null}
        </div>
      )}
    </Card>
  );
}
