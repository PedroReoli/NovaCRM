"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowsClockwise, CircleNotch, Info } from "@/lib/ui/icons";
import { useT } from "@/hooks/i18n/useT";
import type { PendingReceipt } from "./receipt-storage";
import { tituloDoPedido } from "./helpers";

export interface PendingReceiptsCardProps {
  pending: PendingReceipt[];
  uncertainReceiptId: string | null;
  ocupado: (alvo: string) => boolean;
  onVerify: (receipt: PendingReceipt) => void;
}

export function PendingReceiptsCard({
  pending,
  uncertainReceiptId,
  ocupado,
  onVerify,
}: PendingReceiptsCardProps) {
  const t = useT();

  if (pending.length === 0) return null;

  return (
    <Card className="border-info/40 bg-info-bg p-4">
      <div className="flex items-start gap-3">
        <Info size={20} weight="duotone" aria-hidden className="mt-0.5 text-info-fg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">{t("Pedidos aguardando confirmação")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              "Os recibos abaixo foram preservados neste navegador para evitar pedidos duplicados.",
            )}
          </p>
          <div className="mt-3 space-y-2">
            {pending.map((receipt) => (
              <div
                key={receipt.id}
                data-testid={`extension-local-receipt-${receipt.id}`}
                className="flex flex-col gap-2 rounded-md border border-info/25 bg-surface/70 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {tituloDoPedido(receipt.kind, t)} · {receipt.label}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">{receipt.id}</p>
                  {receipt.id === uncertainReceiptId ? (
                    <p role="status" className="mt-1 text-xs text-warning-fg">
                      {t(
                        "A conexão caiu sem confirmação. O pedido foi preservado pelo recibo; verifique o estado antes de tentar outra vez.",
                      )}
                    </p>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid={`extension-local-receipt-verify-${receipt.id}`}
                  disabled={ocupado(`receipt:${receipt.id}`)}
                  onClick={() => onVerify(receipt)}
                >
                  {ocupado(`receipt:${receipt.id}`) ? (
                    <CircleNotch className="animate-spin" aria-hidden />
                  ) : (
                    <ArrowsClockwise aria-hidden />
                  )}
                  {t("Verificar recibo")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
