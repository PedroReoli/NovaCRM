import { addDays, format, startOfWeek } from "date-fns";
import type { Agendamento } from "../tipos";

export const ALTURA_DA_HORA = 48;
export const PRIMEIRA_HORA = 7;
export const ULTIMA_HORA = 21;

export const HORAS = Array.from(
  { length: ULTIMA_HORA - PRIMEIRA_HORA + 1 },
  (_, i) => PRIMEIRA_HORA + i,
);

export function minutosDesdeOTopo(d: Date): number {
  return (d.getHours() - PRIMEIRA_HORA) * 60 + d.getMinutes();
}

export function pixelsDe(minutos: number): number {
  return (minutos / 60) * ALTURA_DA_HORA;
}

export function chaveDoDia(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function instanteDoMinuto(dia: Date, minuto: number): Date {
  const d = new Date(dia);
  d.setHours(Math.floor(minuto / 60), minuto % 60, 0, 0);
  return d;
}

export function diasDaSemanaDe(ancora: Date): Date[] {
  const inicio = startOfWeek(ancora, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(inicio, i));
}

export type Posicionado = { agendamento: Agendamento; coluna: number; colunas: number };

export function repartirSobrepostos(agendamentos: Agendamento[]): Posicionado[] {
  const ordenados = [...agendamentos].sort(
    (a, b) => new Date(a.comeca).getTime() - new Date(b.comeca).getTime(),
  );

  const resultado: Posicionado[] = [];
  let grupo: Array<{ agendamento: Agendamento; coluna: number }> = [];
  let fimDoGrupo = 0;

  const fecharGrupo = () => {
    if (grupo.length === 0) return;
    const colunas = Math.max(...grupo.map((g) => g.coluna)) + 1;
    for (const g of grupo) resultado.push({ ...g, colunas });
    grupo = [];
    fimDoGrupo = 0;
  };

  for (const a of ordenados) {
    const comeca = new Date(a.comeca).getTime();
    const termina = new Date(a.termina).getTime();
    if (grupo.length > 0 && comeca >= fimDoGrupo) fecharGrupo();

    const ocupadas = new Set(
      grupo
        .filter((g) => new Date(g.agendamento.termina).getTime() > comeca)
        .map((g) => g.coluna),
    );
    let coluna = 0;
    while (ocupadas.has(coluna)) coluna += 1;

    grupo.push({ agendamento: a, coluna });
    fimDoGrupo = Math.max(fimDoGrupo, termina);
  }
  fecharGrupo();
  return resultado;
}
