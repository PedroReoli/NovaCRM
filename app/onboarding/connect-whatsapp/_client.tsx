"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { randomId } from "@/lib/random-id";
import { toast } from "sonner";
import { useT } from "@/hooks/i18n/useT";
import { markWhatsappConfigured } from "@/app/actions/onboarding/skipWhatsapp";
import { CanalOficialClient } from "@/components/connections/CanalOficialClient";
import { CanalParceiroClient } from "@/components/connections/CanalParceiroClient";

import {
  type Forma,
  type Props,
  type SessionInfo,
  isRedirectError,
} from "./_types";
import { EscolhaForma } from "./_components/EscolhaForma";
import { Saidas, VoltarParaEscolha } from "./_components/Saidas";
import { QrCodeCard } from "./_components/QrCodeCard";
import styles from "./connect-whatsapp.module.css";

export function ConnectWhatsappClient({
  wahaConfigured,
  sessionName,
  oficialPodeReceber,
}: Props) {
  const t = useT();
  const [, startTransition] = useTransition();
  const [forma, setForma] = useState<Forma | null>(null);
  const createKey = useRef<string | null>(null);
  const restartKey = useRef<string | null>(null);
  const [info, setInfo] = useState<SessionInfo>({ status: "INIT", session: sessionName });
  const [qrTick, setQrTick] = useState(0);
  const [qrFailed, setQrFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const status = info.status;

  // 1) Sobe a sessão QUANDO A PESSOA ESCOLHE o código — não ao montar a tela.
  useEffect(() => {
    if (forma !== "qr") return;
    if (!wahaConfigured) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const res = await fetch("/api/v1/onboarding/whatsapp/session", {
          method: "POST",
          headers: { "Idempotency-Key": (createKey.current ??= randomId()) },
        });
        const json = (await res.json()) as { data?: SessionInfo; error?: { message?: string } };
        if (cancelled) return;
        if (json.data) {
          setInfo(json.data);
          return;
        }
        setInfo({
          status: "ERROR",
          session: sessionName,
          error: json.error?.message ? t(json.error.message) : `${t("o servidor respondeu")} ${res.status}`,
        });
      } catch (err) {
        if (!cancelled) setInfo({ status: "ERROR", session: sessionName, error: String(err) });
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [forma, wahaConfigured, sessionName, t]);

  // 2) Poll status every 3 seconds until WORKING/FAILED.
  useEffect(() => {
    if (forma !== "qr") return;
    if (!wahaConfigured) return;
    if (status === "WORKING" || status === "FAILED") return;
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/v1/onboarding/whatsapp/session");
        const json = (await res.json()) as { data?: SessionInfo };
        if (json.data) {
          setInfo(json.data);
          if (json.data.status === "SCAN_QR_CODE") setQrTick((tk) => tk + 1);
        }
        if (!res.ok) {
          setInfo((antes) =>
            antes.status === "INIT" || antes.status === "STARTING"
              ? { status: "ERROR", session: sessionName, error: `o servidor respondeu ${res.status}` }
              : antes,
          );
        }
      } catch {
        setInfo((antes) =>
          antes.status === "INIT" || antes.status === "STARTING"
            ? { status: "ERROR", session: sessionName, error: "não consegui falar com o servidor" }
            : antes,
        );
      }
    }, 3000);
    return () => clearInterval(id);
  }, [forma, wahaConfigured, status, sessionName, t]);

  // 3) When status → WORKING, auto-advance.
  useEffect(() => {
    if (status !== "WORKING" || !info.session) return;
    const confirmedSession = info.session;
    startTransition(async () => {
      try {
        await markWhatsappConfigured(confirmedSession, "WORKING");
      } catch (err) {
        if (isRedirectError(err)) throw err;
        toast.error(`${t("Falha ao avançar:")} ${String(err)}`);
      }
    });
  }, [status, info.session, t]);

  // Derruba a sessão morta e sobe outra.
  async function restartSession() {
    setBusy(true);
    try {
      const res = await fetch("/api/v1/onboarding/whatsapp/session?restart=1", {
        method: "POST",
        headers: { "Idempotency-Key": (restartKey.current ??= randomId()) },
      });
      const json = (await res.json()) as { data?: SessionInfo };
      if (json.data) {
        setInfo(json.data);
        restartKey.current = null;
      } else {
        toast.error(t("Não consegui gerar outro código. Tente de novo em alguns segundos."));
      }
    } catch {
      toast.error(t("Não consegui falar com o servidor. Confira sua conexão e tente de novo."));
    } finally {
      setBusy(false);
    }
  }

  const showQr = wahaConfigured && status === "SCAN_QR_CODE";

  if (forma === null) {
    return (
      <div className={styles.cardPrincipal}>
        <EscolhaForma forma={forma} onEscolher={setForma} />
        <Saidas status={status} sessionName={info.session ?? ""} />
      </div>
    );
  }

  if (forma === "oficial" || forma === "parceiro") {
    return (
      <div className={styles.cardPrincipal}>
        <VoltarParaEscolha onVoltar={() => setForma(null)} />

        {forma === "oficial" && !oficialPodeReceber && (
          <div className={styles.alertaAviso}>
            <p className={styles.alertaTitulo}>
              {t("Este servidor ainda não está pronto para RECEBER por este caminho.")}
            </p>
            <p className={styles.alertaCorpo}>
              {t(
                "Dá para conectar e já enviar, mas as respostas do cliente não vão chegar até quem administra a instalação cadastrar o App da Meta, em Admin › API Oficial (Meta). Se você quer atender hoje, o caminho do código com o celular funciona agora — e dá para trocar depois, sem perder nada.",
              )}
            </p>
          </div>
        )}

        {forma === "oficial" ? <CanalOficialClient /> : <CanalParceiroClient />}

        <Saidas status={status} sessionName={info.session ?? ""} />
      </div>
    );
  }

  return (
    <div className={styles.cardPrincipal}>
      <VoltarParaEscolha onVoltar={() => setForma(null)} />

      {!wahaConfigured && (
        <div className={styles.alertaAviso}>
          <p className={styles.alertaTitulo}>{t("O WhatsApp desta instalação ainda não subiu.")}</p>
          <p className={styles.alertaCorpo}>
            {t("Ele roda no seu próprio servidor. Dá para seguir sem ele agora e conectar o número depois, em")}{" "}
            <strong>{t("Canais › Conexões")}</strong> —{" "}
            {t("seu funcionário fica pronto de qualquer jeito, só não terá por onde atender ainda.")}
          </p>
        </div>
      )}

      {wahaConfigured && (
        <QrCodeCard
          status={status}
          busy={busy}
          info={info}
          showQr={showQr}
          qrTick={qrTick}
          qrFailed={qrFailed}
          setQrFailed={setQrFailed}
          restartSession={restartSession}
        />
      )}

      <Saidas status={status} sessionName={info.session ?? ""} />
    </div>
  );
}
