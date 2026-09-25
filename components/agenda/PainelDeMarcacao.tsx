"use client";

import { useLocaleDeData } from "@/hooks/i18n/useLocaleDeData";
import { useT } from "@/hooks/i18n/useT";
import { addDays, format, isSameDay, isSameMonth, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { instanteDe } from "@/lib/agenda/fuso";
import { ApiError } from "@/lib/api/types";
import { CaretLeft, CaretRight } from "@/lib/ui/icons";
import { cn } from "@/lib/utils";
import type { HorarioLivre, Pessoa } from "./tipos";
import { MarcadoSucesso } from "./painel-marcacao/MarcadoSucesso";
import { ContextoDaMarcacao } from "./painel-marcacao/ContextoDaMarcacao";
import { ConfirmacaoMarcacao } from "./painel-marcacao/ConfirmacaoMarcacao";
import { AvisosDoPainel } from "./painel-marcacao/AvisosDoPainel";

export type TempoDaMarcacao = "escolhendo-dia" | "escolhendo-horario" | "confirmando" | "marcado";

export function PainelDeMarcacao({
  ancora,
  agora,
  responsavel,
  tipo = "Consulta",
  duracaoMin = 30,
  local,
  fuso,
  horariosPorDia,
  publicouHorarios = true,
  erroAoCarregar = false,
  fusoSuposto = false,
  fontesDefasadas,
  googleCoberturaParcial,
  onMesVisivel,
  quemSeraAtendido,
  horarioInicial,
  permiteEncaixe = false,
  onConfirmar,
  onVerNaAgenda,
  className,
}: {
  ancora: Date;
  agora: Date;
  responsavel: Pessoa;
  tipo?: string;
  duracaoMin?: number;
  local?: string;
  fuso?: string;
  horariosPorDia: Record<string, HorarioLivre[]>;
  publicouHorarios?: boolean;
  erroAoCarregar?: boolean;
  fusoSuposto?: boolean;
  googleCoberturaParcial?: boolean;
  onMesVisivel?: (mes: Date) => void;
  fontesDefasadas?: Array<{ nome?: string; desde?: string }>;
  quemSeraAtendido?: { nome: string; aceitaMensagem: boolean };
  onVerNaAgenda?: (instante: string) => void;
  horarioInicial?: HorarioLivre;
  permiteEncaixe?: boolean;
  onConfirmar?: (instante: string) => void | Promise<unknown>;
  className?: string;
}) {
  const localeDaData = useLocaleDeData();
  const t = useT();

  const [dia, setDia] = React.useState<Date | null>(
    horarioInicial ? new Date(horarioInicial.instante) : null,
  );
  const [horario, setHorario] = React.useState<HorarioLivre | null>(horarioInicial ?? null);
  const [marcado, setMarcado] = React.useState<HorarioLivre | null>(null);
  const [mes, setMes] = React.useState(() =>
    startOfMonth(horarioInicial ? new Date(horarioInicial.instante) : ancora),
  );
  React.useEffect(() => {
    onMesVisivel?.(mes);
  }, [mes, onMesVisivel]);
  const [encaixeAberto, setEncaixeAberto] = React.useState(false);
  const [horaDoEncaixe, setHoraDoEncaixe] = React.useState("");
  const [recusa, setRecusa] = React.useState<{ instante: string; mensagem: string } | null>(null);

  const confirmacaoRef = React.useRef<HTMLDivElement>(null);
  const instanteEscolhido = horario?.instante;
  const mensagemDaRecusa = recusa?.mensagem;
  React.useEffect(() => {
    if (!instanteEscolhido) return;
    confirmacaoRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [instanteEscolhido, mensagemDaRecusa]);

  const instanteInicial = horarioInicial?.instante;
  React.useEffect(() => {
    if (!instanteInicial) return;
    const d = new Date(instanteInicial);
    setDia(d);
    setHorario({ instante: instanteInicial, rotulo: format(d, "HH:mm") });
    setMes(startOfMonth(d));
    setMarcado(null);
  }, [instanteInicial]);

  const tempo: TempoDaMarcacao = marcado
    ? "marcado"
    : horario
      ? "confirmando"
      : dia
        ? "escolhendo-horario"
        : "escolhendo-dia";

  const semanas = React.useMemo(() => {
    const primeiro = startOfWeek(startOfMonth(mes), { weekStartsOn: 0 });
    return Array.from({ length: 6 }, (_, s) =>
      Array.from({ length: 7 }, (_, d) => addDays(primeiro, s * 7 + d)),
    );
  }, [mes]);

  const encaixeLigado = permiteEncaixe && Boolean(fuso) && publicouHorarios && !erroAoCarregar;
  const inicioDeHoje = startOfDay(agora).getTime();

  const diaClicavel = (d: Date): boolean =>
    isSameMonth(d, mes) &&
    ((horariosPorDia[format(d, "yyyy-MM-dd")]?.length ?? 0) > 0 ||
      (encaixeLigado && d.getTime() >= inicioDeHoje));

  const nenhumDiaClicavel = semanas.flat().every((d) => !diaClicavel(d));

  const motivoDoBloqueio: "sem-jornada" | "erro" | "sem-vaga" | null = !publicouHorarios
    ? "sem-jornada"
    : erroAoCarregar
      ? "erro"
      : nenhumDiaClicavel
        ? "sem-vaga"
        : null;

  const razaoDoDia = (noMes: boolean): string =>
    !noMes
      ? t("fora deste mês")
      : motivoDoBloqueio === "sem-jornada"
        ? t("você ainda não publicou seus horários")
        : motivoDoBloqueio === "erro"
          ? t("não consegui carregar os horários")
          : t("nenhum horário livre neste dia");

  const doDia = dia ? (horariosPorDia[format(dia, "yyyy-MM-dd")] ?? []) : [];
  const partesDaHora = /^([01]\d|2[0-3]):([0-5]\d)(?::\d{2})?$/.exec(horaDoEncaixe);

  const usarHoraDoEncaixe = () => {
    if (!dia || !fuso || !partesDaHora) return;
    const instante = instanteDe(
      {
        ano: dia.getFullYear(),
        mes: dia.getMonth() + 1,
        dia: dia.getDate(),
        hora: Number(partesDaHora[1]),
        minuto: Number(partesDaHora[2]),
      },
      fuso,
    ).toISOString();
    setHorario({ instante, rotulo: `${partesDaHora[1]}:${partesDaHora[2]}` });
  };

  const blocoDoEncaixe =
    encaixeLigado && dia ? (
      <div data-testid="encaixe" className={cn("shrink-0", doDia.length > 0 && "mt-2")}>
        {doDia.length === 0 && (
          <p className="mb-2 text-xs text-text-muted">
            {t("Este dia está fora da jornada publicada (folga ou dia sem expediente).")}
          </p>
        )}
        {!encaixeAberto && doDia.length > 0 ? (
          <button
            type="button"
            data-testid="abrir-encaixe"
            onClick={() => setEncaixeAberto(true)}
            className={cn(
              "h-11 w-full rounded-sm border border-dashed border-border text-sm text-text-muted transition-colors duration-fast ease-out lg:h-9",
              "hover:border-accent hover:text-text",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
            )}
          >
            {t("Outro horário")}
          </button>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="hora-do-encaixe" className="block text-xs font-medium text-text-muted">
              {t("Outro horário")}
            </label>
            <div className="flex gap-2">
              <Input
                id="hora-do-encaixe"
                data-testid="hora-do-encaixe"
                type="time"
                step={60}
                value={horaDoEncaixe}
                onChange={(e) => setHoraDoEncaixe(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") usarHoraDoEncaixe();
                }}
                aria-describedby="ajuda-do-encaixe"
                className="h-11 min-w-0 flex-1 px-2 tabular-nums lg:h-9"
              />
              <Button
                variant="outline"
                size="sm"
                data-testid="usar-hora-do-encaixe"
                disabled={!partesDaHora}
                onClick={usarHoraDoEncaixe}
                className="lg:h-9"
              >
                {t("Usar")}
              </Button>
            </div>
            <p id="ajuda-do-encaixe" className="text-[11px] leading-4 text-text-subtle">
              {t("Vale fora dos horários publicados. A agenda só recusa se o horário já estiver ocupado.")}
            </p>
          </div>
        )}
      </div>
    ) : null;

  if (tempo === "marcado" && marcado) {
    return (
      <MarcadoSucesso
        marcado={marcado}
        tipo={tipo}
        duracaoMin={duracaoMin}
        responsavel={responsavel}
        quemSeraAtendido={quemSeraAtendido}
        localeDaData={localeDaData}
        onMarcarOutro={() => {
          setMarcado(null);
          setHorario(null);
          setDia(null);
          setEncaixeAberto(false);
          setHoraDoEncaixe("");
        }}
        onVerNaAgenda={onVerNaAgenda}
        className={className}
      />
    );
  }

  return (
    <div
      data-testid="painel-de-marcacao"
      data-tempo={tempo}
      className={cn(
        "flex min-h-[450px] flex-col overflow-hidden rounded-lg border border-border bg-surface lg:min-h-0 lg:w-fit lg:flex-row",
        className,
      )}
    >
      <ContextoDaMarcacao
        responsavel={responsavel}
        tipo={tipo}
        duracaoMin={duracaoMin}
        local={local}
        fuso={fuso}
      />

      <div
        data-testid="corpo-da-marcacao"
        className="flex min-w-0 flex-1 flex-col p-4 lg:min-w-[420px]"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold first-letter:uppercase">
            {format(mes, t("MMMM 'de' yyyy"), { locale: localeDaData })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Mês anterior")}
              data-testid="mes-anterior"
              onClick={() => setMes((m) => startOfMonth(addDays(startOfMonth(m), -1)))}
            >
              <CaretLeft size={16} weight="bold" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Próximo mês")}
              data-testid="mes-seguinte"
              onClick={() => setMes((m) => startOfMonth(addDays(startOfMonth(m), 32)))}
            >
              <CaretRight size={16} weight="bold" aria-hidden />
            </Button>
          </div>
        </div>

        <AvisosDoPainel
          motivoDoBloqueio={motivoDoBloqueio}
          responsavelNome={responsavel.nome}
          mes={mes}
          localeDaData={localeDaData}
          googleCoberturaParcial={googleCoberturaParcial}
          fusoSuposto={fusoSuposto}
          fuso={fuso}
          fontesDefasadas={fontesDefasadas}
        />

        <div className="grid grid-cols-7 gap-1 text-center">
          {semanas[0]?.map((d) => (
            <span
              key={`c-${d.toISOString()}`}
              className="pb-1 text-[10px] font-semibold uppercase text-text-subtle"
            >
              {format(d, "EEEEEE", { locale: localeDaData }).replace(".", "")}
            </span>
          ))}
          {semanas.flat().map((d) => {
            const chave = format(d, "yyyy-MM-dd");
            const livres = horariosPorDia[chave] ?? [];
            const disponivel = livres.length > 0 && isSameMonth(d, mes);
            const clicavel = diaClicavel(d);
            const soEncaixe = clicavel && !disponivel;
            const escolhido = dia !== null && isSameDay(d, dia);
            return (
              <button
                key={chave}
                type="button"
                data-testid={`dia-${chave}`}
                data-disponivel={disponivel}
                data-encaixe={soEncaixe || undefined}
                disabled={!clicavel}
                aria-label={
                  disponivel
                    ? `${format(d, t("d 'de' MMMM"), { locale: localeDaData })} — ${livres.length} ${t("horários")}`
                    : soEncaixe
                      ? `${format(d, t("d 'de' MMMM"), { locale: localeDaData })} — ${t("nenhum horário publicado neste dia")}`
                      : `${format(d, t("d 'de' MMMM"), { locale: localeDaData })} — ${razaoDoDia(isSameMonth(d, mes))}`
                }
                title={clicavel ? undefined : razaoDoDia(isSameMonth(d, mes))}
                onClick={() => {
                  setDia(d);
                  setHorario(null);
                }}
                className={cn(
                  "flex h-9 items-center justify-center rounded-sm text-sm tabular-nums transition-colors duration-fast ease-out",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
                  !isSameMonth(d, mes) && "text-text-subtle",
                  disponivel && !escolhido && "bg-accent-soft text-text hover:bg-accent hover:text-accent-foreground",
                  soEncaixe && !escolhido && "text-text hover:bg-accent-soft",
                  escolhido && "bg-accent font-semibold text-accent-foreground",
                  !clicavel && "cursor-default text-text-subtle",
                  isSameDay(d, agora) && !escolhido && "ring-1 ring-inset ring-border-strong",
                )}
              >
                {format(d, "d")}
              </button>
            );
          })}
        </div>

        {tempo === "confirmando" && horario && (
          <ConfirmacaoMarcacao
            horario={horario}
            localeDaData={localeDaData}
            recusa={recusa}
            quemSeraAtendido={quemSeraAtendido}
            confirmacaoRef={confirmacaoRef}
            onVoltar={() => setHorario(null)}
            onConfirmarClick={async () => {
              try {
                await onConfirmar?.(horario.instante);
                setRecusa(null);
                setMarcado(horario);
              } catch (err) {
                setRecusa({
                  instante: horario.instante,
                  mensagem:
                    err instanceof ApiError && err.status >= 400 && err.status < 500
                      ? err.message
                      : t("Não foi marcado. Tente de novo."),
                });
              }
            }}
          />
        )}
      </div>

      <div
        data-testid="coluna-de-horarios"
        data-aberta={tempo !== "escolhendo-dia"}
        className="agenda-coluna-horarios lg:shrink-0"
      >
        <div className="flex h-full w-full flex-col p-3 lg:w-[280px]">
          <p className="mb-2 shrink-0 text-xs font-semibold text-text-muted first-letter:uppercase">
            {dia ? format(dia, t("EEEE, d 'de' MMM"), { locale: localeDaData }) : ""}
          </p>
          {doDia.length === 0 && blocoDoEncaixe}
          <div
            data-testid="lista-de-horarios"
            className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1 lg:max-h-[min(42vh,380px)]"
          >
            {doDia.map((h) => (
              <button
                key={h.instante}
                type="button"
                data-testid={`horario-${h.rotulo}`}
                onClick={() => setHorario(h)}
                className={cn(
                  "h-11 shrink-0 rounded-sm border text-sm tabular-nums transition-colors duration-fast ease-out",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
                  horario?.instante === h.instante
                    ? "border-accent bg-accent font-semibold text-accent-foreground"
                    : "border-border bg-surface text-text hover:border-accent hover:bg-accent-soft",
                )}
              >
                {h.rotulo}
              </button>
            ))}
          </div>

          {doDia.length > 0 && blocoDoEncaixe}
        </div>
      </div>
    </div>
  );
}
