import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/i18n/useT";
import { TokenCounter } from "@/lib/ui/TokenCounter";
import type { ModelOption } from "./ModelPicker";

interface AgentPromptCardProps {
  systemPrompt: string;
  disabled: boolean;
  modelMeta?: ModelOption | null;
  validationError?: string;
  onPatch: (patch: { system_prompt: string }) => void;
}

export function AgentPromptCard({
  systemPrompt,
  disabled,
  modelMeta,
  validationError,
  onPatch,
}: AgentPromptCardProps) {
  const t = useT();

  return (
    <Card className="space-y-2 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("As instruções dele")}</h3>
        <div className="flex items-center gap-2">
          <span
            data-testid="contador-do-prompt"
            className={
              systemPrompt.trim().length > 20000
                ? "text-xs text-destructive"
                : "text-xs text-muted-foreground"
            }
          >
            {systemPrompt.trim().length.toLocaleString("pt-BR")}/20.000
          </span>
          <TokenCounter
            text={systemPrompt}
            contextWindow={modelMeta?.context_window ?? null}
            className="text-xs"
          />
        </div>
      </div>
      <Textarea
        value={systemPrompt}
        onChange={(e) => onPatch({ system_prompt: e.target.value })}
        disabled={disabled}
        rows={12}
        spellCheck={false}
        className="font-mono text-xs"
        aria-invalid={!!validationError}
      />
      {validationError ? <p className="text-xs text-destructive">{validationError}</p> : null}
    </Card>
  );
}
