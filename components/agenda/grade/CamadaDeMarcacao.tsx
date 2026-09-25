import * as React from "react";
import { format } from "date-fns";
import { useLocaleDeData } from "@/hooks/i18n/useLocaleDeData";
import { useT } from "@/hooks/i18n/useT";
import {
  PASSO_DA_CELULA_MIN,
  horarioNaCelula,
  razaoDoBloco,
} from "@/lib/agenda/grade-interativa";
import { cn } from "@/lib/utils";
import type { Agendamento } from "../tipos";
import type { InteracaoDaGrade } from "../GradeDaAgenda";
import {
  PRIMEIRA_HORA,
  ULTIMA_HORA,
  chaveDoDia,
  instanteDoMinuto,
  pixelsDe,
} from "./helpers";

const CELULAS = Array.from(
  { length: ((ULTIMA_HORA - PRIMEIRA_HORA + 1) * 60) / PASSO_DA_CELULA_MIN },
  (_, i) => PRIMEIRA_HORA * 60 + i * PASSO_DA_CELULA_MIN,
);

export function CamadaDeMarcacao({
  dia,
  agora,
  agendamentosDoDia,
  interacao,
}: {
  dia: Date;
  agora: Date;
  agendamentosDoDia: Agendamento[];
  interacao: InteracaoDaGrade;
}) {
  const t = useT();
  const localeDaData = useLocaleDeData();
  const chave = chaveDoDia(dia);
  const publicados = interacao.horariosPorDia[chave] ?? [];

  return (
    <>
      {CELULAS.map((minuto) => {
        const livre = horarioNaCelula(publicados, minuto);
        const inicio = instanteDoMinuto(dia, minuto);
        const fim = instanteDoMinuto(dia, minuto + PASSO_DA_CELULA_MIN);
        const ocupado = agendamentosDoDia.some(
          (a) =>
            a.situacao !== "cancelled" &&
            new Date(a.comeca) < fim &&
            new Date(a.termina) > inicio,
        );
        const passado = fim.getTime() <= agora.getTime();
        const rotulo = format(inicio, "HH:mm");
        const razao = t(razaoDoBloco({ motivo: interacao.motivo, ocupado, passado }));

        return (
          <button
            key={minuto}
            type="button"
            data-testid={`bloco-${chave}-${rotulo}`}
            data-livre={livre !== null}
            disabled={livre === null}
            aria-label={
              livre
                ? t("Marcar às {hora} de {data}")
                    .replace("{hora}", livre.rotulo)
                    .replace("{data}", format(dia, t("d 'de' MMMM"), { locale: localeDaData }))
                : t("{data} às {hora} — {motivo}")
                    .replace("{data}", format(dia, t("d 'de' MMMM"), { locale: localeDaData }))
                    .replace("{hora}", rotulo)
                    .replace("{motivo}", razao)
            }
            title={livre ? undefined : razao}
            onClick={livre ? () => interacao.onMarcarEm(livre.instante) : undefined}
            className={cn(
              "absolute inset-x-0 z-0 transition-colors duration-fast ease-out",
              "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-500",
              livre ? "cursor-pointer hover:bg-accent-soft" : "cursor-default",
            )}
            style={{
              top: pixelsDe(minuto - PRIMEIRA_HORA * 60),
              height: pixelsDe(PASSO_DA_CELULA_MIN),
            }}
          />
        );
      })}
    </>
  );
}
