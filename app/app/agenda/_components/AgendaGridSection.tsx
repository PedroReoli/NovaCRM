"use client";

import * as React from "react";
import { AgendaInterativa } from "@/components/agenda/AgendaInterativa";
import type { Agendamento, Pessoa, VisaoDaAgenda } from "@/components/agenda/tipos";
import { EmptyAgenda } from "@/components/empty";
import styles from "./AgendaGridSection.module.css";

interface AgendaGridSectionProps {
  visao: VisaoDaAgenda;
  ancora: Date;
  agora: Date;
  pessoas: Pessoa[];
  agendamentosDaGrade: Agendamento[];
  recorteDaGrade: { de: string; ate: string };
  tiposIniciais: Array<{ id: string; nome: string; duracaoMin: number }>;
  tipo: { id: string; duracaoMin: number } | null;
  onEscolherTipo: (id: string | null) => void;
  totalAgendamentos: number;
  onMarcarEm?: (instante: string) => void;
  onAbrirAgendamento: (id: string) => void;
}

export function AgendaGridSection({
  visao,
  ancora,
  agora,
  pessoas,
  agendamentosDaGrade,
  recorteDaGrade,
  tiposIniciais,
  tipo,
  onEscolherTipo,
  totalAgendamentos,
  onMarcarEm,
  onAbrirAgendamento,
}: AgendaGridSectionProps) {
  return (
    <div className={styles.gridSection}>
      {totalAgendamentos === 0 ? (
        <div className={styles.emptyWrapper}>
          <EmptyAgenda />
        </div>
      ) : null}

      <AgendaInterativa
        visao={visao}
        ancora={ancora}
        agora={agora}
        pessoas={pessoas}
        agendamentos={agendamentosDaGrade}
        recorte={recorteDaGrade}
        tipos={tiposIniciais.map((t) => ({ id: t.id, nome: t.nome, duracaoMin: t.duracaoMin }))}
        tipo={tipo ? { id: tipo.id, duracaoMin: tipo.duracaoMin } : null}
        onEscolherTipo={onEscolherTipo}
        onMarcarEm={onMarcarEm}
        onAbrirAgendamento={onAbrirAgendamento}
        className="min-h-0 flex-1"
      />
    </div>
  );
}
