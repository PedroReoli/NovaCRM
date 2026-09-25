import { ApiError } from "@/lib/api/types";
import type { ChannelSession } from "@/hooks/channels/useChannelSessions";
import { lerEstadoDoCanal } from "@/lib/channels/estado";
import { fonteDeTemplates } from "@/lib/channels/templates-fonte";

export type Variant = "success" | "warning" | "error" | "neutral";

export function statusInfo(
  status: string,
  t: (texto: string) => string,
): { label: string; variant: Variant } {
  const l = lerEstadoDoCanal(status);
  return { label: t(l.rotulo), variant: l.tom as Variant };
}

export function errMsg(err: unknown, fallback: string, t: (texto: string) => string): string {
  return err instanceof ApiError && err.message ? t(err.message) : t(fallback);
}

export function dependeDoTransporte(c: ChannelSession): boolean {
  return Boolean(c.waha_session_name);
}

export function ehCanalOficial(c: ChannelSession): boolean {
  return fonteDeTemplates(c.provider) === "oficial";
}

export function contar(
  n: number,
  singular: string,
  plural: string,
  t: (texto: string) => string,
): string | null {
  if (n <= 0) return null;
  return `${n} ${t(n === 1 ? singular : plural)}`;
}

export function enumerar(partes: (string | null)[], t: (texto: string) => string): string {
  const uteis = partes.filter((p): p is string => p !== null);
  const ultimo = uteis.pop() ?? "";
  return uteis.length > 0 ? `${uteis.join(", ")} ${t("e")} ${ultimo}` : ultimo;
}
