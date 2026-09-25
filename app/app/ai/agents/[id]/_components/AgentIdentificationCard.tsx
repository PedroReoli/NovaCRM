import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/i18n/useT";

interface AgentIdentificationCardProps {
  name: string;
  description: string;
  priority: number;
  disabled: boolean;
  validation: {
    name?: string;
    priority?: string;
  };
  onPatch: (patch: { name?: string; description?: string; priority?: number }) => void;
}

export function AgentIdentificationCard({
  name,
  description,
  priority,
  disabled,
  validation,
  onPatch,
}: AgentIdentificationCardProps) {
  const t = useT();

  return (
    <Card className="space-y-3 p-4">
      <h3 className="text-sm font-medium">{t("Quem é este agente")}</h3>
      <div className="space-y-1">
        <Label htmlFor="name">{t("Nome")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onPatch({ name: e.target.value })}
          disabled={disabled}
          maxLength={120}
          aria-invalid={!!validation.name}
        />
        {validation.name ? <p className="text-xs text-destructive">{validation.name}</p> : null}
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">{t("Descrição")}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onPatch({ description: e.target.value })}
          disabled={disabled}
          rows={2}
          maxLength={2000}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="priority">{t("Ordem de preferência (0 a 1000)")}</Label>
        <Input
          id="priority"
          type="number"
          min={0}
          max={1000}
          step={1}
          value={priority}
          onChange={(e) => onPatch({ priority: Number(e.target.value) })}
          disabled={disabled}
          aria-invalid={!!validation.priority}
        />
        {validation.priority ? (
          <p className="text-xs text-destructive">{validation.priority}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {t(
            "Quando mais de um agente puder atender a mesma conversa, o de número maior tenta primeiro. Se você só tem um agente, pode deixar como está.",
          )}
        </p>
      </div>
    </Card>
  );
}
