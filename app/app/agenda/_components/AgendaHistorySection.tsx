"use client";

import * as React from "react";
import { HistoricoDaAgenda } from "@/components/agenda/HistoricoDaAgenda";
import type { Agendamento, Pessoa } from "@/components/agenda/tipos";
import styles from "./AgendaHistorySection.module.css";

interface AgendaHistorySectionProps {
  agendamentosAcionaveis: Agendamento[];
  agendamentos: Agendamento[];
  pessoas: Pessoa[];
  agora: Date;
  isExpanded?: boolean;
  onRemarcar: (id: string) => void;
  onCancelar: (id: string) => void;
  onConfirmar: (id: string, revision?: number) => void;
  onRealizado: (id: string, revision?: number) => void;
  onFaltou: (id: string, revision?: number) => void;
}

export function AgendaHistorySection({
  agendamentosAcionaveis,
  agendamentos,
  pessoas,
  agora,
  isExpanded = false,
  onRemarcar,
  onCancelar,
  onConfirmar,
  onRealizado,
  onFaltou,
}: AgendaHistorySectionProps) {
  return (
    <div
      className={`${styles.historySection} ${
        isExpanded ? styles.historyExpanded : styles.historyCompact
      }`}
    >
      <HistoricoDaAgenda
        agendamentos={agendamentosAcionaveis}
        pessoas={pessoas}
        agora={agora}
        className={isExpanded ? "flex-1 min-h-0" : "max-h-[320px]"}
        onRemarcar={onRemarcar}
        onCancelar={onCancelar}
        onConfirmar={(id) => {
          const rev = agendamentos.find((a) => a.id === id)?.revision;
          onConfirmar(id, rev);
        }}
        onRealizado={(id) => {
          const rev = agendamentos.find((a) => a.id === id)?.revision;
          onRealizado(id, rev);
        }}
        onFaltou={(id) => {
          const rev = agendamentos.find((a) => a.id === id)?.revision;
          onFaltou(id, rev);
        }}
      />
    </div>
  );
}
