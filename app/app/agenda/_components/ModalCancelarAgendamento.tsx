"use client";

import * as React from "react";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";
import type { Agendamento } from "@/components/agenda/tipos";

export interface ModalCancelarAgendamentoProps {
  cancelandoId: string | null;
  setCancelandoId: (id: string | null) => void;
  motivo: string;
  setMotivo: (motivo: string) => void;
  cancelar: {
    isPending: boolean;
    mutateAsync: (args: { id: string; revision?: number; reason: string }) => Promise<any>;
  };
  todos: Agendamento[];
  localeDaData: any;
}

export function ModalCancelarAgendamento({
  cancelandoId,
  setCancelandoId,
  motivo,
  setMotivo,
  cancelar,
  todos,
  localeDaData,
}: ModalCancelarAgendamentoProps) {
  const t = useT();

  return (
    <Sheet
      open={cancelandoId !== null}
      onOpenChange={(aberto) => {
        if (!aberto) setCancelandoId(null);
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("Cancelar agendamento")}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3" data-testid="painel-de-cancelamento">
          <p className="text-sm text-text-muted">
            {(() => {
              const alvo = todos.find((a) => a.id === cancelandoId);
              if (!alvo) return t("Este agendamento não está mais na lista.");
              const quem = alvo.quemSeraAtendido ? ` ${t("de")} ${alvo.quemSeraAtendido}` : "";
              return `${alvo.titulo}${quem}, ${format(new Date(alvo.comeca), t("d 'de' MMMM 'às' HH:mm"), { locale: localeDaData })}.`;
            })()}
          </p>
          <label
            className="block text-xs font-medium text-text-muted"
            htmlFor="motivo-do-cancelamento"
          >
            {t("Por que está cancelando?")}
          </label>
          <textarea
            id="motivo-do-cancelamento"
            data-testid="motivo-do-cancelamento"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-surface p-2 text-sm outline-hidden focus:border-border-strong"
            placeholder={t("O paciente pediu para remarcar por telefone")}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCancelandoId(null)}>
              {t("Voltar")}
            </Button>
            <Button
              size="sm"
              data-testid="confirmar-cancelamento"
              disabled={motivo.trim().length < 3 || cancelar.isPending}
              onClick={() => {
                const id = cancelandoId;
                if (!id) return;
                void cancelar
                  .mutateAsync({
                    id,
                    revision: todos.find((a) => a.id === id)?.revision,
                    reason: motivo.trim(),
                  })
                  .then(
                    () => setCancelandoId(null),
                    () => undefined,
                  );
              }}
            >
              {cancelar.isPending ? t("Cancelando…") : t("Cancelar agendamento")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
