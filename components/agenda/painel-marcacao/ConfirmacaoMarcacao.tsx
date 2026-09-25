import * as React from "react";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { Button } from "@/components/ui/button";
import { Warning } from "@/lib/ui/icons";
import { useT } from "@/hooks/i18n/useT";
import type { HorarioLivre } from "../tipos";

interface ConfirmacaoMarcacaoProps {
  horario: HorarioLivre;
  localeDaData: Locale;
  recusa: { instante: string; mensagem: string } | null;
  quemSeraAtendido?: { nome: string; aceitaMensagem: boolean };
  confirmacaoRef: React.RefObject<HTMLDivElement | null>;
  onVoltar: () => void;
  onConfirmarClick: () => Promise<void>;
}

export function ConfirmacaoMarcacao({
  horario,
  localeDaData,
  recusa,
  quemSeraAtendido,
  confirmacaoRef,
  onVoltar,
  onConfirmarClick,
}: ConfirmacaoMarcacaoProps) {
  const t = useT();

  return (
    <div
      ref={confirmacaoRef}
      className="mt-4 border-t border-border pt-4"
      data-testid="confirmacao"
    >
      <p className="text-sm">
        <span className="text-text-muted">{t("Confirmar")} </span>
        <span className="font-semibold">
          {format(new Date(horario.instante), t("EEEE, d 'de' MMMM 'às' HH:mm"), {
            locale: localeDaData,
          })}
        </span>
      </p>

      {recusa?.instante === horario.instante && (
        <div
          data-testid="recusa-da-marcacao"
          role="alert"
          className="mt-3 flex gap-2 rounded-sm border border-warning/40 bg-warning-bg p-2.5 lg:w-0 lg:min-w-full"
        >
          <Warning size={16} weight="fill" className="mt-0.5 shrink-0 text-warning" aria-hidden />
          <p className="text-xs leading-4 text-text">{recusa.mensagem}</p>
        </div>
      )}

      {quemSeraAtendido && !quemSeraAtendido.aceitaMensagem && (
        <div
          data-testid="aviso-sem-lembrete"
          role="status"
          className="mt-3 flex gap-2 rounded-sm border border-warning/40 bg-warning-bg p-2.5"
        >
          <Warning size={16} weight="fill" className="mt-0.5 shrink-0 text-warning" aria-hidden />
          <p className="text-xs leading-4 text-text">
            <span className="font-semibold">
              {quemSeraAtendido.nome} {t("pediu para não receber mensagens.")}
            </span>{" "}
            {t("O lembrete não será enviado — combine por telefone.")}
          </p>
        </div>
      )}
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onVoltar}>
          {t("Voltar")}
        </Button>
        <Button
          size="sm"
          data-testid="confirmar-marcacao"
          onClick={onConfirmarClick}
        >
          {t("Confirmar")}
        </Button>
      </div>
    </div>
  );
}
