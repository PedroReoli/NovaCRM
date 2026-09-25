import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useT } from "@/hooks/i18n/useT";
import { FollowupWindowEditor, type FollowupWindowValue } from "./FollowupWindowEditor";
import { FollowupFlowPicker } from "./FollowupFlowPicker";

interface FollowupValue {
  enabled: boolean;
  flow_pointer_ids: string[];
  send_window?: FollowupWindowValue | null;
}

interface AgentFollowupCardProps {
  followup: FollowupValue;
  disabled: boolean;
  onPatch: (patch: { followup: FollowupValue }) => void;
}

export function AgentFollowupCard({
  followup,
  disabled,
  onPatch,
}: AgentFollowupCardProps) {
  const t = useT();

  return (
    <Card className="space-y-3 p-4">
      <h3 className="text-sm font-medium">{t("Follow-up")}</h3>
      <p className="text-xs text-muted-foreground">
        {t(
          "Retomar sozinho quem parou de responder, para o interessado não sumir sem ninguém perceber.",
        )}
      </p>
      <div className="flex items-center gap-2">
        <Switch
          id="followup_enabled"
          checked={followup.enabled}
          onCheckedChange={(v) => onPatch({ followup: { ...followup, enabled: v } })}
          disabled={disabled}
        />
        <Label htmlFor="followup_enabled">
          {t("Habilitar gatilhos automáticos de follow-up")}
        </Label>
      </div>
      <p className="text-xs text-muted-foreground">
        {t(
          "Os fluxos abaixo só entram em ação para um cliente se este agente estiver publicado com follow-up habilitado.",
        )}
      </p>
      <FollowupWindowEditor
        value={followup.send_window ?? null}
        onChange={(send_window) => onPatch({ followup: { ...followup, send_window } })}
        disabled={disabled || !followup.enabled}
      />
      <FollowupFlowPicker
        value={followup.flow_pointer_ids}
        onChange={(ids) => onPatch({ followup: { ...followup, flow_pointer_ids: ids } })}
        disabled={disabled}
      />
    </Card>
  );
}
