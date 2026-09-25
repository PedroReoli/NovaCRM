import type { Campaign } from "./_types";
import { labels } from "./_types";
import { useT } from "@/hooks/i18n/useT";

interface CampaignsListProps {
  campaigns?: Campaign[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CampaignsList({ campaigns, selectedId, onSelect }: CampaignsListProps) {
  const t = useT();

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">{t("Suas campanhas")}</h2>
      <div className="space-y-2">
        {campaigns?.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={`w-full rounded-lg border p-3 text-left transition-colors ${
              selectedId === c.id ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/30"
            }`}
          >
            <span className="block text-sm font-medium">{c.name}</span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {t(labels[c.status] ?? c.status)} · {c.result_count} {t("empresas")}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
