import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/i18n/useT";

interface AgentLimitsCardProps {
  maxSteps: number;
  tokenBudget: number;
  costBudgetCents: number;
  historyMessageWindow: number;
  historyTokenWindow: number;
  disabled: boolean;
  onPatch: (patch: {
    max_steps?: number;
    token_budget?: number;
    cost_budget_cents?: number;
    history_message_window?: number;
    history_token_window?: number;
  }) => void;
}

export function AgentLimitsCard({
  maxSteps,
  tokenBudget,
  costBudgetCents,
  historyMessageWindow,
  historyTokenWindow,
  disabled,
  onPatch,
}: AgentLimitsCardProps) {
  const t = useT();

  return (
    <Card className="space-y-3 p-4">
      <h3 className="text-sm font-medium">{t("Freios de segurança")}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="max_steps">{t("Ações por atendimento (1 a 25)")}</Label>
          <Input
            id="max_steps"
            type="number"
            min={1}
            max={25}
            value={maxSteps}
            onChange={(e) => onPatch({ max_steps: Number(e.target.value) })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="token_budget">{t("Volume de texto por atendimento")}</Label>
          <Input
            id="token_budget"
            type="number"
            min={1000}
            max={500000}
            step={1000}
            value={tokenBudget}
            onChange={(e) => onPatch({ token_budget: Number(e.target.value) })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cost_budget_cents">{t("Custo máximo por atendimento (centavos)")}</Label>
          <Input
            id="cost_budget_cents"
            type="number"
            min={1}
            max={10000}
            value={costBudgetCents}
            onChange={(e) => onPatch({ cost_budget_cents: Number(e.target.value) })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="history_message_window">{t("Mensagens anteriores que ele lê")}</Label>
          <Input
            id="history_message_window"
            type="number"
            min={0}
            max={200}
            value={historyMessageWindow}
            onChange={(e) => onPatch({ history_message_window: Number(e.target.value) })}
            disabled={disabled}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label htmlFor="history_token_window">{t("Tamanho máximo desse histórico")}</Label>
          <Input
            id="history_token_window"
            type="number"
            min={0}
            max={50000}
            step={500}
            value={historyTokenWindow}
            onChange={(e) => onPatch({ history_token_window: Number(e.target.value) })}
            disabled={disabled}
          />
        </div>
      </div>
    </Card>
  );
}
