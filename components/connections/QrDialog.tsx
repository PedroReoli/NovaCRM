import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { useT } from "@/hooks/i18n/useT";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowsClockwise, CheckCircle, CircleNotch } from "@/lib/ui/icons";
import { PairingOptions } from "./PairingOptions";
import { errMsg } from "./helpers";

interface QrDialogProps {
  sessionId: string;
  title: string;
  wahaConfigured: boolean;
  onClose: () => void;
  onConnected: () => void;
  onForcePair: (sessionId: string) => Promise<void>;
}

export function QrDialog({
  sessionId,
  title,
  wahaConfigured,
  onClose,
  onConnected,
  onForcePair,
}: QrDialogProps) {
  const t = useT();
  const [status, setStatus] = useState<string>("STARTING");
  const [tick, setTick] = useState(0);
  const [pairing, setPairing] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (!wahaConfigured) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await apiClient.get<{ data: { status: string } }>(
          `/api/v1/channel-sessions/${sessionId}`,
        );
        if (cancelled) return;
        const s = res.data.status;
        setStatus(s);
        if (s === "WORKING" && !done.current) {
          done.current = true;
          onConnected();
        }
      } catch {
        // erro transitório de rede — o próximo tick tenta de novo
      }
    };
    void poll();
    const iv = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [sessionId, wahaConfigured, onConnected]);

  useEffect(() => {
    if (status !== "SCAN_QR_CODE") return;
    const iv = setInterval(() => setTick((v) => v + 1), 15_000);
    return () => clearInterval(iv);
  }, [status]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {t("Escolha QR Code ou código de pareamento e confirme no WhatsApp do celular.")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-[16rem] flex-col items-center justify-center gap-3 py-2">
          {status === "SCAN_QR_CODE" ? (
            <PairingOptions
              key={sessionId}
              sessionId={sessionId}
              qr={
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/v1/channel-sessions/${sessionId}/qr?t=${tick}`}
                  alt={t("QR Code para conectar WhatsApp")}
                  className="h-64 w-64 rounded-md border bg-white p-2"
                />
              }
            />
          ) : status === "WORKING" ? (
            <div className="flex flex-col items-center gap-2 text-sm font-medium text-success-fg">
              <CheckCircle size={28} weight="fill" aria-hidden />
              {t("Conectado!")}
            </div>
          ) : status === "FAILED" || status === "STOPPED" ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-error-fg">
                {t(
                  "Este número foi desvinculado do WhatsApp. Para usá-lo de novo é preciso parear outra vez.",
                )}
              </p>
              <Button
                size="sm"
                disabled={pairing}
                onClick={async () => {
                  setPairing(true);
                  try {
                    await onForcePair(sessionId);
                    setStatus("STARTING");
                  } catch (err) {
                    toast.error(errMsg(err, "Não foi possível gerar um novo QR.", t));
                  } finally {
                    setPairing(false);
                  }
                }}
              >
                {pairing ? (
                  <CircleNotch size={14} className="animate-spin" aria-hidden />
                ) : (
                  <ArrowsClockwise size={14} aria-hidden />
                )}
                {t("Gerar novo QR")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <CircleNotch size={28} className="animate-spin" aria-hidden />
              {t("Preparando o código…")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
