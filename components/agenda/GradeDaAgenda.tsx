"use client";

import * as React from "react";
import { isSameDay } from "date-fns";
import type { HorarioPublicado, MotivoDaGradeTravada } from "@/lib/agenda/grade-interativa";
import { cn } from "@/lib/utils";
import type { Agendamento, Pessoa, VisaoDaAgenda } from "./tipos";
import { VisaoDeMes } from "./grade/VisaoDeMes";
import { ColunaDeDia } from "./grade/ColunaDeDia";
import { useArrasteDaGrade } from "./grade/useArrasteDaGrade";
import {
  ALTURA_DA_HORA,
  HORAS,
  PRIMEIRA_HORA,
  ULTIMA_HORA,
  diasDaSemanaDe,
} from "./grade/helpers";

export interface InteracaoDaGrade {
  /** `yyyy-MM-dd` → horários publicados naquele dia. */
  horariosPorDia: Record<string, HorarioPublicado[]>;
  /** Por que a grade inteira está travada, quando está. */
  motivo: MotivoDaGradeTravada | null;
  /** Duração do tipo escolhido — o tamanho do bloco que se está marcando. */
  duracaoMin: number;
  /** Clique num bloco livre. Recebe o instante PUBLICADO, nunca um calculado. */
  onMarcarEm: (instante: string) => void;
  /**
   * Um card foi solto (ou movido pelo teclado). `instante` nulo quer dizer que
   * o destino está fora da disponibilidade — quem recebe RECUSA e diz `razao`,
   * em vez de remarcar em silêncio ou aproximar para o horário mais perto.
   */
  onArrastarPara?: (entrada: { id: string; instante: string | null; razao: string }) => void;
}

function ColunaDeHoras() {
  return (
    <div className="w-12 shrink-0 select-none border-r border-border" aria-hidden>
      <div className="h-8 border-b border-border" />
      {HORAS.map((h) => (
        <div
          key={h}
          className="relative border-b border-border/50 text-right"
          style={{ height: ALTURA_DA_HORA }}
        >
          <span className="absolute -top-1.5 right-1 text-[10px] tabular-nums text-text-subtle">
            {String(h).padStart(2, "0")}h
          </span>
        </div>
      ))}
    </div>
  );
}

export function GradeDaAgenda({
  visao,
  ancora,
  agora,
  pessoas,
  agendamentos,
  onAbrirAgendamento,
  interacao,
  className,
}: {
  visao: VisaoDaAgenda;
  /** O período que a grade mostra. */
  ancora: Date;
  /**
   * O instante do "agora" — INJETADO, nunca `new Date()` aqui dentro.
   */
  agora: Date;
  pessoas: Pessoa[];
  agendamentos: Agendamento[];
  onAbrirAgendamento?: (id: string) => void;
  /** Ausente = grade só de leitura, como a vitrine a monta. Ver `InteracaoDaGrade`. */
  interacao?: InteracaoDaGrade;
  className?: string;
}) {
  const dias = visao === "dia" ? [ancora] : diasDaSemanaDe(ancora);
  const { gradeRef, proposta, arrasteDoCard } = useArrasteDaGrade({
    interacao,
    agendamentos,
    agora,
  });

  return (
    <div
      data-testid="grade-da-agenda"
      data-visao={visao}
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-surface",
        className,
      )}
    >
      {visao === "mes" ? (
        <VisaoDeMes ancora={ancora} agora={agora} agendamentos={agendamentos} pessoas={pessoas} />
      ) : (
        <div ref={gradeRef} className="flex min-h-0 flex-1 overflow-auto">
          <ColunaDeHoras />
          <div className="flex min-w-0 flex-1">
            {dias.map((d) => (
              <ColunaDeDia
                key={d.toISOString()}
                dia={d}
                agora={agora}
                agendamentos={agendamentos}
                pessoas={pessoas}
                onAbrir={onAbrirAgendamento}
                destacado={visao === "semana" && isSameDay(d, agora)}
                soNoDesktop={visao === "semana" && !isSameDay(d, ancora)}
                interacao={interacao}
                proposta={proposta}
                arrasteDoCard={arrasteDoCard}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const ALTURA_DA_HORA_PX = ALTURA_DA_HORA;
export const JANELA_DA_GRADE = { primeira: PRIMEIRA_HORA, ultima: ULTIMA_HORA };
