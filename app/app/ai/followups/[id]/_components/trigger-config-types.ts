import {
  DEFAULT_THRESHOLD_MINUTES as DEFAULT_RETORNO_MINUTES,
  limiarDaTela,
  minutosDoLimiar,
  type UnidadeDeLimiar,
} from "@/lib/followup/gap-de-retorno";

export type TriggerKind =
  | "appointment_no_show"
  | "manual"
  | "silence"
  | "stage_change"
  | "case_opened"
  | "webhook"
  | "inbound_after_silence"
  | "lead_created";

export interface TriggerFormState {
  kind: TriggerKind;
  thresholdMinutes: number;
  thresholdValor: number;
  thresholdUnidade: UnidadeDeLimiar;
  segments: string;
  stageId: string;
  cancelOnReply: boolean;
  eventTypeIds: string[];
}

export const DEFAULT_THRESHOLD_MINUTES = 60;
export const MIN_THRESHOLD_MINUTES = 5;

export const KIND_LABEL: Record<TriggerKind, string> = {
  appointment_no_show: "Falta confirmada pela equipe",
  manual: "Manual",
  silence: "Silêncio",
  stage_change: "Etapa do funil",
  case_opened: "Agente pediu ajuda",
  webhook: "Automação (Webhooks)",
  inbound_after_silence: "Cliente voltou",
  lead_created: "Lead criado",
};

export function parseTriggerConfig(raw: Record<string, unknown>): TriggerFormState {
  const kind: TriggerKind =
    raw.kind === "appointment_no_show"
      ? "appointment_no_show"
      : raw.kind === "silence"
        ? "silence"
        : raw.kind === "inbound_after_silence"
          ? "inbound_after_silence"
          : raw.kind === "stage_change"
            ? "stage_change"
            : raw.kind === "case_opened"
              ? "case_opened"
              : raw.kind === "webhook"
                ? "webhook"
                : raw.kind === "lead_created"
                  ? "lead_created"
                  : "manual";
  const params =
    (raw.params as { threshold_minutes?: number; segments?: string[]; stage_id?: string; event_type_ids?: string[] } | undefined) ?? {};
  const minutosRetorno =
    kind === "inbound_after_silence" && typeof params.threshold_minutes === "number"
      ? params.threshold_minutes
      : DEFAULT_RETORNO_MINUTES;
  const tela = limiarDaTela(minutosRetorno);
  return {
    kind,
    eventTypeIds: Array.isArray(params.event_type_ids) ? params.event_type_ids : [],
    thresholdMinutes:
      kind === "silence" && typeof params.threshold_minutes === "number"
        ? params.threshold_minutes
        : DEFAULT_THRESHOLD_MINUTES,
    thresholdValor: tela.valor,
    thresholdUnidade: tela.unidade,
    segments:
      (kind === "silence" || kind === "inbound_after_silence") && Array.isArray(params.segments)
        ? params.segments.join(", ")
        : "",
    stageId: kind === "stage_change" && typeof params.stage_id === "string" ? params.stage_id : "",
    cancelOnReply: raw.cancel_on_reply === true,
  };
}

export function toTriggerConfig(form: TriggerFormState): Record<string, unknown> {
  const cancelOnReply = form.cancelOnReply ? { cancel_on_reply: true } : {};
  if (form.kind === "appointment_no_show") return { kind: "appointment_no_show", params: { event_type_ids: form.eventTypeIds } };
  if (form.kind === "manual") return { kind: "manual", ...cancelOnReply };

  if (form.kind === "stage_change") {
    return { kind: "stage_change", params: { stage_id: form.stageId }, ...cancelOnReply };
  }

  if (form.kind === "case_opened") return { kind: "case_opened", ...cancelOnReply };
  if (form.kind === "webhook") return { kind: "webhook", ...cancelOnReply };
  if (form.kind === "lead_created") return { kind: "lead_created", ...cancelOnReply };

  const segments = form.segments
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (form.kind === "inbound_after_silence") {
    const minutes = minutosDoLimiar(form.thresholdValor, form.thresholdUnidade);
    return {
      kind: "inbound_after_silence",
      params: {
        threshold_minutes: Number.isFinite(minutes) ? minutes : DEFAULT_RETORNO_MINUTES,
        ...(segments.length > 0 ? { segments } : {}),
      },
      ...cancelOnReply,
    };
  }

  return {
    kind: "silence",
    params: { threshold_minutes: form.thresholdMinutes, ...(segments.length > 0 ? { segments } : {}) },
    ...cancelOnReply,
  };
}

export function summaryLabel(
  cfg: Record<string, unknown>,
  etapa: { stageName: string; pipelineName: string } | null,
  t: (texto: string) => string = (texto) => texto,
): string {
  if (cfg.kind === "appointment_no_show") return t("Gatilho: falta confirmada pela equipe");
  if (cfg.kind === "silence") {
    const minutes = (cfg.params as { threshold_minutes?: number } | undefined)?.threshold_minutes;
    return `Gatilho: Silêncio${typeof minutes === "number" ? ` (${minutes} min)` : ""}`;
  }
  if (cfg.kind === "inbound_after_silence") {
    const minutes = (cfg.params as { threshold_minutes?: number } | undefined)?.threshold_minutes;
    const tela = limiarDaTela(typeof minutes === "number" ? minutes : DEFAULT_RETORNO_MINUTES);
    const unidade =
      tela.unidade === "days"
        ? tela.valor === 1
          ? t("dia")
          : t("dias")
        : tela.unidade === "hours"
          ? tela.valor === 1
            ? t("hora")
            : t("horas")
          : tela.valor === 1
            ? t("minuto")
            : t("minutos");
    return `${t("Gatilho")}: ${t("Cliente voltou")} (${tela.valor} ${unidade})`;
  }
  if (cfg.kind === "stage_change") {
    return etapa ? `Gatilho: entrou em «${etapa.stageName}» em ${etapa.pipelineName}` : "Gatilho: Etapa do funil";
  }
  if (cfg.kind === "case_opened") return `${t("Gatilho")}: ${t("quando o agente pede ajuda")}`;
  if (cfg.kind === "webhook") return t("Disparado por uma automação em Webhooks");
  if (cfg.kind === "lead_created") return `${t("Gatilho")}: ${t("Lead criado")}`;
  if (cfg.kind === "manual" || cfg.kind === undefined) return `${t("Gatilho")}: ${t("Manual")}`;
  return `Gatilho: ${String(cfg.kind)} (indisponível)`;
}
