import * as React from "react";
import { differenceInMinutes, format } from "date-fns";
import { useT } from "@/hooks/i18n/useT";
import { cn } from "@/lib/utils";
import { corDaTrilha, fundoDaTrilha } from "../paleta";
import type { Agendamento, Pessoa } from "../tipos";
import { minutosDesdeOTopo, pixelsDe } from "./helpers";

export function BlocoDeAgendamento({
  agendamento,
  pessoa,
  onAbrir,
  coluna,
  colunas,
  arraste,
}: {
  agendamento: Agendamento;
  pessoa: Pessoa | undefined;
  onAbrir?: (id: string) => void;
  coluna: number;
  colunas: number;
  arraste?: {
    ativo: boolean;
    aoApontar: (e: React.PointerEvent<HTMLButtonElement>, a: Agendamento) => void;
    aoTeclar: (e: React.KeyboardEvent<HTMLButtonElement>, a: Agendamento) => void;
    moveu: () => boolean;
  };
}) {
  const t = useT();
  const comeca = new Date(agendamento.comeca);
  const termina = new Date(agendamento.termina);
  const duracao = Math.max(differenceInMinutes(termina, comeca), 15);
  const trilha = pessoa?.trilha ?? 1;
  const doGoogle = agendamento.origem === "google_sync";
  const cancelado = agendamento.situacao === "cancelled";

  return (
    <button
      type="button"
      data-testid={`agendamento-${agendamento.id}`}
      data-origem={agendamento.origem}
      data-trilha={trilha}
      data-situacao={agendamento.situacao}
      data-colunas={colunas}
      data-coluna={coluna}
      disabled={doGoogle}
      data-arrastavel={arraste !== undefined && !doGoogle && !cancelado}
      data-arrastando={arraste?.ativo === true}
      onClick={
        doGoogle
          ? undefined
          : () => {
              if (!arraste?.moveu()) onAbrir?.(agendamento.id);
            }
      }
      onPointerDown={
        arraste && !doGoogle && !cancelado ? (e) => arraste.aoApontar(e, agendamento) : undefined
      }
      onKeyDown={
        arraste && !doGoogle && !cancelado ? (e) => arraste.aoTeclar(e, agendamento) : undefined
      }
      aria-label={`${agendamento.titulo}, ${format(comeca, "HH:mm")} ${t("às")} ${format(termina, "HH:mm")}${
        agendamento.quemSeraAtendido ? `, ${t("com")} ${agendamento.quemSeraAtendido}` : ""
      }${pessoa ? `, ${t("atendido por")} ${pessoa.nome}` : ""}${
        doGoogle ? `, ${t("ocupado na agenda do Google")}` : ""
      }`}
      className={cn(
        "absolute flex flex-col items-start overflow-hidden rounded-sm px-1.5 py-0.5 text-left",
        "border border-border/60 transition-colors duration-fast ease-out",
        doGoogle ? "cursor-default" : "cursor-pointer hover:border-border-strong",
        arraste && !doGoogle && !cancelado && "cursor-grab active:cursor-grabbing touch-none",
        cancelado && "pointer-events-none opacity-55",
        arraste?.ativo && "opacity-40",
      )}
      style={{
        top: pixelsDe(minutosDesdeOTopo(comeca)),
        height: Math.max(pixelsDe(duracao) - 2, 18),
        left: `calc(${(coluna / colunas) * 100}% + 2px)`,
        width: `calc(${(1 / colunas) * 100}% - 4px)`,
        background: doGoogle
          ? "repeating-linear-gradient(135deg, var(--color-surface-elevated) 0 6px, var(--color-surface) 6px 12px)"
          : fundoDaTrilha(trilha),
        opacity: doGoogle ? 0.75 : undefined,
      }}
    >
      <span
        aria-hidden
        data-testid={`faixa-${agendamento.id}`}
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-sm"
        style={{ backgroundColor: doGoogle ? "var(--color-border-strong)" : corDaTrilha(trilha) }}
      />
      <span className="ml-1 truncate text-[11px] font-semibold leading-4 text-text">
        {agendamento.titulo}
      </span>
      {duracao >= 45 && (
        <span className="ml-1 truncate text-[10px] leading-3 tabular-nums text-text-muted">
          {format(comeca, "HH:mm")}
          {agendamento.quemSeraAtendido ? ` · ${agendamento.quemSeraAtendido}` : ""}
        </span>
      )}
    </button>
  );
}
