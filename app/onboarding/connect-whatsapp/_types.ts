export type Forma = "qr" | "oficial" | "parceiro";

export type Status =
  | "INIT"
  | "STARTING"
  | "SCAN_QR_CODE"
  | "WORKING"
  | "FAILED"
  | "STOPPED"
  | "NOT_STARTED"
  | "ERROR";

export interface SessionInfo {
  status: Status;
  session: string | null;
  channel_session_id?: string;
  error?: string;
}

export interface Props {
  wahaConfigured: boolean;
  sessionName: string;
  oficialPodeReceber: boolean;
}

/**
 * Server actions throw a sentinel `NEXT_REDIRECT` when calling `redirect()`.
 */
export function isRedirectError(err: unknown): boolean {
  return Boolean(
    err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT"),
  );
}

/**
 * O estado do pareamento em palavras — nunca o enum do transporte.
 */
export function rotuloDoEstado(s: Status, t: (texto: string) => string): string {
  switch (s) {
    case "SCAN_QR_CODE":
      return t("Pronto para conectar");
    case "STARTING":
    case "INIT":
      return t("Preparando o código…");
    case "WORKING":
      return t("Conectado!");
    case "FAILED":
      return t("O código expirou");
    default:
      return t("Não consegui falar com o WhatsApp");
  }
}

export function explicacaoDoEstado(s: Status, t: (texto: string) => string): string {
  switch (s) {
    case "SCAN_QR_CODE":
      return t("Escolha QR Code ou código de pareamento e confirme no WhatsApp do celular.");
    case "STARTING":
    case "INIT":
      return t("Isso leva alguns segundos. O código aparece aqui sozinho.");
    case "WORKING":
      return t("O número está no ar. Seguindo para o próximo passo.");
    case "FAILED":
      return t("É normal — ele vale poucos minutos. Dá para gerar outro.");
    default:
      return t("O serviço roda no seu servidor e não respondeu agora.");
  }
}
