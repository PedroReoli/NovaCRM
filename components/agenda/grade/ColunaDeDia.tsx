import * as React from "react";
import { format, isSameDay } from "date-fns";
import { useLocaleDeData } from "@/hooks/i18n/useLocaleDeData";
import { useT } from "@/hooks/i18n/useT";
import { cn } from "@/lib/utils";
import type { Agendamento, Pessoa } from "../tipos";
import type { InteracaoDaGrade } from "../GradeDaAgenda";
import { BlocoDeAgendamento } from "./BlocoDeAgendamento";
import { CamadaDeMarcacao } from "./CamadaDeMarcacao";
import type { PropostaDeRemarcacao } from "./useArrasteDaGrade";
import {
  ALTURA_DA_HORA,
  HORAS,
  PRIMEIRA_HORA,
  chaveDoDia,
  minutosDesdeOTopo,
  pixelsDe,
  repartirSobrepostos,
} from "./helpers";

function ReguaDoAgora({ agora }: { agora: Date }) {
  const minutos = minutosDesdeOTopo(agora);
  if (minutos < 0 || minutos > (21 - PRIMEIRA_HORA + 1) * 60) return null;
  return (
    <div
      data-testid="regua-do-agora"
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
      style={{ top: pixelsDe(minutos) }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-error" />
      <span className="h-px flex-1 bg-error" />
    </div>
  );
}

function FantasmaDoArraste({
  proposta,
  duracaoMin,
}: {
  proposta: PropostaDeRemarcacao;
  duracaoMin: number;
}) {
  const t = useT();
  const localeDaData = useLocaleDeData();
  const valido = proposta.instante !== null;
  return (
    <div
      data-testid="fantasma-do-arraste"
      data-instante={proposta.instante ?? ""}
      data-valido={valido}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0.5 z-20 rounded-sm border-2 border-dashed px-1.5 py-0.5",
        valido ? "border-accent bg-accent-soft" : "border-error bg-error-bg",
      )}
      style={{
        top: pixelsDe(proposta.minuto - PRIMEIRA_HORA * 60),
        height: Math.max(pixelsDe(duracaoMin) - 2, 18),
      }}
    >
      <span className="truncate text-[10px] font-semibold leading-4 text-text">
        {valido
          ? format(new Date(proposta.instante!), "HH:mm", { locale: localeDaData })
          : t(proposta.razao)}
      </span>
    </div>
  );
}

export function ColunaDeDia({
  dia,
  agora,
  agendamentos,
  pessoas,
  onAbrir,
  destacado,
  soNoDesktop,
  interacao,
  proposta,
  arrasteDoCard,
}: {
  dia: Date;
  agora: Date;
  agendamentos: Agendamento[];
  pessoas: Pessoa[];
  onAbrir?: (id: string) => void;
  destacado: boolean;
  soNoDesktop?: boolean;
  interacao?: InteracaoDaGrade;
  proposta?: PropostaDeRemarcacao | null;
  arrasteDoCard?: {
    aoApontar: (e: React.PointerEvent<HTMLButtonElement>, a: Agendamento) => void;
    aoTeclar: (e: React.KeyboardEvent<HTMLButtonElement>, a: Agendamento) => void;
    moveu: () => boolean;
  };
}) {
  const localeDaData = useLocaleDeData();
  const doDia = agendamentos.filter((c) => isSameDay(new Date(c.comeca), dia));
  const ehHoje = isSameDay(dia, agora);

  return (
    <div
      data-testid={`coluna-dia-${format(dia, "yyyy-MM-dd")}`}
      className={cn(
        "relative min-w-0 flex-1 border-r border-border last:border-r-0",
        soNoDesktop && "max-md:hidden",
        destacado && "bg-surface-elevated/40",
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-20 flex h-8 items-center justify-center gap-1.5 border-b border-border bg-surface px-2",
        )}
      >
        <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {format(dia, "EEE", { locale: localeDaData }).replace(".", "")}
        </span>
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] tabular-nums",
            ehHoje ? "bg-accent text-accent-foreground font-semibold" : "text-text",
          )}
        >
          {format(dia, "d")}
        </span>
      </div>

      <div
        className="relative"
        data-corpo-do-dia={chaveDoDia(dia)}
        style={{ height: HORAS.length * ALTURA_DA_HORA }}
      >
        {HORAS.map((h) => (
          <div
            key={h}
            className="border-b border-border/50"
            style={{ height: ALTURA_DA_HORA }}
          />
        ))}
        {interacao && (
          <CamadaDeMarcacao
            dia={dia}
            agora={agora}
            agendamentosDoDia={doDia}
            interacao={interacao}
          />
        )}
        {repartirSobrepostos(doDia).map(({ agendamento, coluna, colunas }) => (
          <BlocoDeAgendamento
            key={agendamento.id}
            agendamento={agendamento}
            pessoa={pessoas.find((p) => p.id === agendamento.responsavelId)}
            onAbrir={onAbrir}
            coluna={coluna}
            colunas={colunas}
            arraste={
              arrasteDoCard
                ? { ...arrasteDoCard, ativo: proposta?.id === agendamento.id }
                : undefined
            }
          />
        ))}
        {proposta && proposta.dia === chaveDoDia(dia) && (
          <FantasmaDoArraste proposta={proposta} duracaoMin={interacao?.duracaoMin ?? 30} />
        )}
        {ehHoje && <ReguaDoAgora agora={agora} />}
      </div>
    </div>
  );
}
