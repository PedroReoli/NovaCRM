"use client";

import { PairingOptions } from "@/components/connections/PairingOptions";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";
import {
  type SessionInfo,
  type Status,
  rotuloDoEstado,
  explicacaoDoEstado,
} from "../_types";
import styles from "./QrCodeCard.module.css";

interface QrCodeCardProps {
  status: Status;
  busy: boolean;
  info: SessionInfo;
  showQr: boolean;
  qrTick: number;
  qrFailed: boolean;
  setQrFailed: (failed: boolean) => void;
  restartSession: () => void;
}

export function QrCodeCard({
  status,
  busy,
  info,
  showQr,
  qrTick,
  qrFailed,
  setQrFailed,
  restartSession,
}: QrCodeCardProps) {
  const t = useT();
  const estadoAtual = busy ? "STARTING" : status;

  return (
    <div className={styles.container}>
      <div>
        <p className={styles.tituloStatus}>{rotuloDoEstado(estadoAtual, t)}</p>
        <p className={styles.explicacaoStatus}>{explicacaoDoEstado(estadoAtual, t)}</p>
      </div>

      {showQr && info.channel_session_id && (
        <PairingOptions
          key={info.channel_session_id}
          sessionId={info.channel_session_id}
          qr={
            <div className={styles.qrContainer}>
              {qrFailed ? (
                <p className={styles.textoDetalhe}>
                  {t(
                    "Não consegui carregar o código agora. Ele deve reaparecer sozinho em instantes — se não aparecer, gere outro abaixo.",
                  )}
                </p>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={qrTick}
                  src={`/api/v1/onboarding/whatsapp/qr?t=${qrTick}`}
                  alt={t("Código QR para conectar o WhatsApp")}
                  className={styles.qrImagem}
                  onError={() => setQrFailed(true)}
                  onLoad={() => setQrFailed(false)}
                />
              )}
            </div>
          }
        />
      )}

      {status === "WORKING" && (
        <p className={styles.textoConectado}>
          ✓ {t("Conectado! Avançando…")}
        </p>
      )}

      {status === "FAILED" && (
        <div className={styles.blocoAviso}>
          <p className={styles.textoAviso}>
            {t("O código expirou antes de alguém escanear. É normal — ele vale só alguns minutos.")}
          </p>
          <p className={styles.textoDetalhe}>
            {t("Deixe o WhatsApp já aberto em")} <strong>{t("Aparelhos conectados")}</strong>{" "}
            {t("antes de gerar o próximo, que aí dá tempo de sobra.")}
          </p>
          <div>
            <Button type="button" size="sm" disabled={busy} onClick={restartSession}>
              {busy ? t("Gerando…") : t("Gerar novo QR Code")}
            </Button>
          </div>
        </div>
      )}

      {(status === "ERROR" || status === "NOT_STARTED" || status === "STOPPED") && (
        <div className={styles.blocoAviso}>
          <p className="text-sm">
            {t(
              "O serviço de WhatsApp desta instalação não respondeu. Ele roda no seu servidor, junto com o resto do sistema — quem instalou consegue religá-lo.",
            )}
          </p>
          {info.error && (
            <p className={styles.textoDetalhe}>
              {t("Detalhe técnico:")} <code className={styles.codigoErro}>{info.error}</code>
            </p>
          )}
          <div>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={restartSession}>
              {busy ? t("Tentando…") : t("Tentar de novo")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
