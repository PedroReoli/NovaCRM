import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useT } from "@/hooks/i18n/useT";

interface AgentSplitMessagesCardProps {
  splitMessages: boolean;
  splitMaxChars: number;
  disabled: boolean;
  validationError?: string;
  onPatch: (patch: { split_messages?: boolean; split_max_chars?: number }) => void;
}

export function AgentSplitMessagesCard({
  splitMessages,
  splitMaxChars,
  disabled,
  validationError,
  onPatch,
}: AgentSplitMessagesCardProps) {
  const t = useT();

  return (
    <Card className="space-y-3 p-4">
      <h3 className="text-sm font-medium">{t("Estilo de resposta")}</h3>
      <div className="flex items-center gap-2">
        <Switch
          id="split_messages"
          checked={splitMessages}
          onCheckedChange={(v) => onPatch({ split_messages: v })}
          disabled={disabled}
        />
        <Label htmlFor="split_messages">
          {t("Responder em várias mensagens curtas (como uma pessoa digita)")}
        </Label>
      </div>
      <p className="text-xs text-muted-foreground">
        {t(
          "Em vez de um bloco único, a resposta sai em bolhas separadas, espaçadas pelo mesmo ritmo anti-banimento do envio. O agente também é instruído a escrever em parágrafos curtos.",
        )}
      </p>
      {splitMessages ? (
        <div className="space-y-1">
          <Label htmlFor="split_max_chars">{t("Tamanho máximo por bolha (80–4000)")}</Label>
          <Input
            id="split_max_chars"
            type="number"
            min={80}
            max={4000}
            step={20}
            value={splitMaxChars}
            onChange={(e) => onPatch({ split_max_chars: Number(e.target.value) })}
            disabled={disabled}
            aria-invalid={!!validationError}
          />
          {validationError ? <p className="text-xs text-destructive">{validationError}</p> : null}
        </div>
      ) : null}
    </Card>
  );
}
