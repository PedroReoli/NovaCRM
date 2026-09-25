import { Card } from "@/components/ui/card";
import { useT } from "@/hooks/i18n/useT";
import { TriggerEditor, type TriggerValue } from "./TriggerEditor";

interface AgentTriggerCardProps {
  value: TriggerValue;
  disabled: boolean;
  onChange: (value: TriggerValue) => void;
}

export function AgentTriggerCard({
  value,
  disabled,
  onChange,
}: AgentTriggerCardProps) {
  const t = useT();

  return (
    <Card className="space-y-2 p-4">
      <h3 className="text-sm font-medium">{t("Quando ele entra em ação")}</h3>
      <TriggerEditor
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </Card>
  );
}
