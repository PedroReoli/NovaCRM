import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useT } from "@/hooks/i18n/useT";
import { HandoffKeywordsInput } from "./HandoffKeywordsInput";

interface AgentHandoffCardProps {
  handoffToolEnabled: boolean;
  handoffKeywords: string[];
  casesEnabled: boolean;
  disabled: boolean;
  onPatch: (patch: {
    handoff_tool_enabled?: boolean;
    handoff_keywords?: string[];
    cases_enabled?: boolean;
  }) => void;
}

export function AgentHandoffCard({
  handoffToolEnabled,
  handoffKeywords,
  casesEnabled,
  disabled,
  onPatch,
}: AgentHandoffCardProps) {
  const t = useT();

  return (
    <>
      <Card className="space-y-3 p-4">
        <h3 className="text-sm font-medium">{t("Passar para uma pessoa")}</h3>
        <div className="flex items-center gap-2">
          <Switch
            id="handoff_tool_enabled"
            checked={handoffToolEnabled}
            onCheckedChange={(v) => onPatch({ handoff_tool_enabled: v })}
            disabled={disabled}
          />
          <Label htmlFor="handoff_tool_enabled">
            {t("Deixar o agente chamar uma pessoa quando perceber que não é caso dele")}
          </Label>
        </div>
        <HandoffKeywordsInput
          value={handoffKeywords}
          onChange={(v) => onPatch({ handoff_keywords: v })}
          disabled={disabled}
        />
      </Card>

      <Card className="space-y-3 p-4">
        <h3 className="text-sm font-medium">{t("Pedir ajuda sem sair da conversa")}</h3>
        <div className="flex items-center gap-2">
          <Switch
            id="cases_enabled"
            checked={casesEnabled}
            onCheckedChange={(v) => onPatch({ cases_enabled: v })}
            disabled={disabled}
          />
          <Label htmlFor="cases_enabled">
            {t("Deixar o agente pedir uma tarefa a alguém e seguir conversando")}
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          {t(
            "Diferente de passar a conversa: aqui o agente continua atendendo. Quando esbarra em algo que só uma pessoa resolve — aprovar um desconto, por exemplo — ele abre um pedido interno e retoma assim que for respondido.",
          )}
        </p>
      </Card>
    </>
  );
}
