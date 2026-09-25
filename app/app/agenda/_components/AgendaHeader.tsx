"use client";

import * as React from "react";
import { addDays } from "date-fns";
import { CalendarPlus, CaretLeft, CaretRight } from "@/lib/ui/icons";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/i18n/useT";
import { Button } from "@/components/ui/button";
import { FiltroDePessoas } from "@/components/agenda/FiltroDePessoas";
import type { VisaoDaAgenda } from "@/components/agenda/tipos";
import { ancoraLocalDoDia } from "@/lib/agenda/semana-semente";

const VISOES: Array<{ id: VisaoDaAgenda; rotulo: string }> = [
  { id: "dia", rotulo: "Dia" },
  { id: "semana", rotulo: "Semana" },
  { id: "mes", rotulo: "Mês" },
];

export interface AgendaHeaderProps {
  hojeNaOrganizacao: string;
  podeMarcar: boolean;
  tipo: { id: string; nome: string } | null;
  abrirMarcacao: () => void;
  passo: number;
  periodo: string;
  setAncora: React.Dispatch<React.SetStateAction<Date>>;
  pessoas: any[];
  isolada: string | null;
  setIsolada: (id: string | null) => void;
  visao: VisaoDaAgenda;
  setVisao: (v: VisaoDaAgenda) => void;
}

export function AgendaHeader({
  hojeNaOrganizacao,
  podeMarcar,
  tipo,
  abrirMarcacao,
  passo,
  periodo,
  setAncora,
  pessoas,
  isolada,
  setIsolada,
  visao,
  setVisao,
}: AgendaHeaderProps) {
  const t = useT();

  return (
    <>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{t("Agenda")}</h1>
          <p className="text-sm text-text-muted">
            {t("O que está marcado, com quem, e quem atende — seu e da equipe.")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAncora(ancoraLocalDoDia(hojeNaOrganizacao))}
          >
            {t("Hoje")}
          </Button>

          {podeMarcar && !tipo && (
            <span
              data-testid="motivo-novo-agendamento"
              className="hidden text-xs text-text-subtle sm:inline"
            >
              {t("Cadastre um tipo de agendamento para começar")}
            </span>
          )}

          {podeMarcar && (
            <Button
              size="sm"
              disabled={!tipo}
              data-testid="novo-agendamento"
              title={tipo ? undefined : t("Cadastre um tipo de agendamento para começar")}
              onClick={abrirMarcacao}
            >
              <CalendarPlus size={16} weight="bold" aria-hidden />
              <span>{t("Novo agendamento")}</span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Período anterior")}
              data-testid="periodo-anterior"
              onClick={() => setAncora((d) => addDays(d, -passo))}
            >
              <CaretLeft size={16} weight="bold" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Próximo período")}
              data-testid="periodo-seguinte"
              onClick={() => setAncora((d) => addDays(d, passo))}
            >
              <CaretRight size={16} weight="bold" aria-hidden />
            </Button>
          </div>

          <span
            data-testid="periodo"
            className="truncate text-sm font-semibold first-letter:uppercase"
          >
            {periodo}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FiltroDePessoas pessoas={pessoas} isolada={isolada} onIsolar={setIsolada} />
          <div
            data-testid="alternador-de-visao"
            className="flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5"
          >
            {VISOES.map((v) => (
              <button
                key={v.id}
                type="button"
                data-testid={`visao-${v.id}`}
                aria-pressed={visao === v.id}
                onClick={() => setVisao(v.id)}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-xs transition-colors duration-fast ease-out",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
                  visao === v.id
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-text-muted hover:bg-surface-elevated hover:text-text",
                )}
              >
                {t(v.rotulo)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
