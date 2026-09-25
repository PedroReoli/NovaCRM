import * as React from "react";
import { addDays } from "date-fns";
import {
  PASSO_DA_CELULA_MIN,
  alvoDoArraste,
  celulaQueContem,
  minutoSobY,
  publicadoVizinho,
  razaoDoBloco,
} from "@/lib/agenda/grade-interativa";
import type { Agendamento } from "../tipos";
import type { InteracaoDaGrade } from "../GradeDaAgenda";
import {
  ALTURA_DA_HORA,
  PRIMEIRA_HORA,
  ULTIMA_HORA,
  chaveDoDia,
  instanteDoMinuto,
} from "./helpers";

export interface PropostaDeRemarcacao {
  id: string;
  dia: string;
  minuto: number;
  minutoBruto: number;
  instante: string | null;
  razao: string;
}

export function useArrasteDaGrade({
  interacao,
  agendamentos,
  agora,
}: {
  interacao?: InteracaoDaGrade;
  agendamentos: Agendamento[];
  agora: Date;
}) {
  const gradeRef = React.useRef<HTMLDivElement>(null);
  const [proposta, setProposta] = React.useState<PropostaDeRemarcacao | null>(null);

  const gesto = React.useRef<{
    id: string;
    x0: number;
    y0: number;
    deslocamentoNoCard: number;
    moveu: boolean;
  } | null>(null);

  const limites = { primeiro: PRIMEIRA_HORA * 60, ultimo: (ULTIMA_HORA + 1) * 60 };

  const montarProposta = React.useCallback(
    (id: string, chave: string, minutoBruto: number): PropostaDeRemarcacao => {
      const publicados = interacao?.horariosPorDia[chave] ?? [];
      const alvo = alvoDoArraste(publicados, minutoBruto);
      const dia = new Date(`${chave}T12:00:00`);
      const minutoCelula = celulaQueContem(minutoBruto);
      const inicio = instanteDoMinuto(dia, minutoCelula);
      const fim = instanteDoMinuto(dia, minutoCelula + PASSO_DA_CELULA_MIN);
      const ocupado = agendamentos.some(
        (a) =>
          a.id !== id &&
          a.situacao !== "cancelled" &&
          new Date(a.comeca) < fim &&
          new Date(a.termina) > inicio,
      );
      return {
        id,
        dia: chave,
        minuto: alvo
          ? new Date(alvo.instante).getHours() * 60 + new Date(alvo.instante).getMinutes()
          : minutoCelula,
        minutoBruto,
        instante: alvo?.instante ?? null,
        razao: razaoDoBloco({
          motivo: interacao?.motivo ?? null,
          ocupado,
          passado: fim.getTime() <= agora.getTime(),
        }),
      };
    },
    [agendamentos, agora, interacao],
  );

  const propostaSobPonto = React.useCallback(
    (id: string, clientX: number, clientYDoTopo: number): PropostaDeRemarcacao | null => {
      const corpos = Array.from(
        gradeRef.current?.querySelectorAll<HTMLElement>("[data-corpo-do-dia]") ?? [],
      );
      if (corpos.length === 0) return null;
      const escolhido =
        corpos.find((el) => {
          const r = el.getBoundingClientRect();
          return clientX >= r.left && clientX <= r.right;
        }) ??
        corpos.reduce((melhor, el) => {
          const d = (r: DOMRect) =>
            Math.min(Math.abs(clientX - r.left), Math.abs(clientX - r.right));
          return d(el.getBoundingClientRect()) < d(melhor.getBoundingClientRect()) ? el : melhor;
        });
      const chave = escolhido.dataset.corpoDoDia;
      if (!chave) return null;
      const r = escolhido.getBoundingClientRect();
      const bruto = minutoSobY({
        y: clientYDoTopo - r.top,
        alturaDaHoraPx: ALTURA_DA_HORA,
        primeiraHora: PRIMEIRA_HORA,
      });
      return montarProposta(
        id,
        chave,
        Math.min(Math.max(bruto, limites.primeiro), limites.ultimo - PASSO_DA_CELULA_MIN),
      );
    },
    [montarProposta, limites.primeiro, limites.ultimo],
  );

  const aoApontar = React.useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, a: Agendamento) => {
      if (e.button !== 0 || !interacao?.onArrastarPara) return;
      const el = e.currentTarget;
      const g = {
        id: a.id,
        x0: e.clientX,
        y0: e.clientY,
        deslocamentoNoCard: e.clientY - el.getBoundingClientRect().top,
        moveu: false,
      };
      gesto.current = g;
      el.setPointerCapture(e.pointerId);

      const mover = (ev: PointerEvent) => {
        if (!g.moveu && Math.abs(ev.clientY - g.y0) < 4 && Math.abs(ev.clientX - g.x0) < 4) return;
        g.moveu = true;
        setProposta(propostaSobPonto(g.id, ev.clientX, ev.clientY - g.deslocamentoNoCard));
      };
      const soltar = (ev: PointerEvent) => {
        window.removeEventListener("pointermove", mover);
        window.removeEventListener("pointerup", soltar);
        window.removeEventListener("pointercancel", soltar);
        const houve = g.moveu;
        const p = houve
          ? propostaSobPonto(g.id, ev.clientX, ev.clientY - g.deslocamentoNoCard)
          : null;
        setProposta(null);
        setTimeout(() => {
          gesto.current = null;
        }, 0);
        if (p) interacao.onArrastarPara?.({ id: g.id, instante: p.instante, razao: p.razao });
      };
      window.addEventListener("pointermove", mover);
      window.addEventListener("pointerup", soltar);
      window.addEventListener("pointercancel", soltar);
    },
    [interacao, propostaSobPonto],
  );

  const aoTeclar = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, a: Agendamento) => {
      if (!interacao?.onArrastarPara) return;
      const atual = proposta?.id === a.id ? proposta : null;
      const comeca = new Date(a.comeca);

      if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        const dia = atual?.dia ?? chaveDoDia(comeca);
        const base = atual ? atual.minutoBruto : comeca.getHours() * 60 + comeca.getMinutes();
        const direcao = e.key === "ArrowDown" ? 1 : -1;
        const vizinho = publicadoVizinho(interacao.horariosPorDia[dia] ?? [], base, direcao);
        const alvo = vizinho
          ? new Date(vizinho.instante).getHours() * 60 + new Date(vizinho.instante).getMinutes()
          : base + direcao * PASSO_DA_CELULA_MIN;
        setProposta(
          montarProposta(
            a.id,
            dia,
            Math.min(Math.max(alvo, limites.primeiro), limites.ultimo - PASSO_DA_CELULA_MIN),
          ),
        );
        return;
      }
      if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        const base = atual ? atual.minutoBruto : comeca.getHours() * 60 + comeca.getMinutes();
        const diaAtual = new Date(`${atual?.dia ?? chaveDoDia(comeca)}T12:00:00`);
        setProposta(
          montarProposta(
            a.id,
            chaveDoDia(addDays(diaAtual, e.key === "ArrowRight" ? 1 : -1)),
            base,
          ),
        );
        return;
      }
      if (atual && e.key === "Enter") {
        e.preventDefault();
        setProposta(null);
        interacao.onArrastarPara?.({ id: a.id, instante: atual.instante, razao: atual.razao });
        return;
      }
      if (atual && e.key === "Escape") {
        e.preventDefault();
        setProposta(null);
      }
    },
    [interacao, proposta, montarProposta, limites.primeiro, limites.ultimo],
  );

  const arrasteDoCard = interacao?.onArrastarPara
    ? { aoApontar, aoTeclar, moveu: () => gesto.current?.moveu === true }
    : undefined;

  return {
    gradeRef,
    proposta,
    arrasteDoCard,
  };
}
