import { Card } from "@/components/ui/card";
import { useT } from "@/hooks/i18n/useT";
import { ToolPicker } from "./ToolPicker";

interface AgentCapabilitiesCardProps {
  toolIds: string[];
  disabled: boolean;
  validationError?: string;
  onChange: (toolIds: string[]) => void;
}

export function AgentCapabilitiesCard({
  toolIds,
  disabled,
  validationError,
  onChange,
}: AgentCapabilitiesCardProps) {
  const t = useT();

  return (
    <Card className="space-y-2 p-4">
      <h3 className="text-sm font-medium">{t("O que o agente pode fazer")}</h3>
      <p className="text-xs text-muted-foreground">
        {t(
          "Ligue por jornada de trabalho. O agente só consegue fazer o que estiver ligado aqui — e o que estiver ligado, ele fará sozinho durante o atendimento.",
        )}
      </p>
      <ToolPicker
        value={toolIds}
        onChange={onChange}
        disabled={disabled}
      />
      {validationError ? (
        <p className="text-xs text-destructive">{validationError}</p>
      ) : null}
    </Card>
  );
}
