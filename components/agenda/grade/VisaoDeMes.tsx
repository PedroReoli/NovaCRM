import { addDays, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { useLocaleDeData } from "@/hooks/i18n/useLocaleDeData";
import { cn } from "@/lib/utils";
import { corDaTrilha, fundoDaTrilha } from "../paleta";
import type { Agendamento, Pessoa } from "../tipos";

export function VisaoDeMes({
  ancora,
  agora,
  agendamentos,
  pessoas,
}: {
  ancora: Date;
  agora: Date;
  agendamentos: Agendamento[];
  pessoas: Pessoa[];
}) {
  const localeDaData = useLocaleDeData();
  const primeiro = startOfWeek(startOfMonth(ancora), { weekStartsOn: 0 });
  const semanas: Date[][] = Array.from({ length: 6 }, (_, s) =>
    Array.from({ length: 7 }, (_, d) => addDays(primeiro, s * 7 + d)),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-7 border-b border-border">
        {semanas[0]?.map((d) => (
          <div
            key={`cab-${d.toISOString()}`}
            className="px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted"
          >
            {format(d, "EEEEEE", { locale: localeDaData }).replace(".", "")}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-[repeat(auto-fit,minmax(0,1fr))]">
        {semanas.flat().map((d) => {
          const doDia = agendamentos.filter((c) => isSameDay(new Date(c.comeca), d));
          const doMes = isSameMonth(d, ancora);
          return (
            <div
              key={d.toISOString()}
              data-testid={`celula-mes-${format(d, "yyyy-MM-dd")}`}
              className={cn(
                "min-h-20 border-b border-r border-border p-1",
                !doMes && "bg-surface-elevated/30",
              )}
            >
              <div className="mb-1 flex items-center justify-between px-0.5">
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] tabular-nums",
                    isSameDay(d, agora)
                      ? "bg-accent font-semibold text-accent-foreground"
                      : doMes
                        ? "text-text"
                        : "text-text-subtle",
                  )}
                >
                  {format(d, "d")}
                </span>
                {doDia.length > 2 && (
                  <span className="text-[10px] tabular-nums text-text-subtle">
                    +{doDia.length - 2}
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                {doDia.slice(0, 2).map((c) => {
                  const trilha = pessoas.find((p) => p.id === c.responsavelId)?.trilha ?? 1;
                  return (
                    <div
                      key={c.id}
                      data-testid={`chip-mes-${c.id}`}
                      data-origem={c.origem}
                      className="flex items-center gap-1 rounded-sm px-1 py-0.5"
                      style={{ background: fundoDaTrilha(trilha, 14) }}
                    >
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: corDaTrilha(trilha) }}
                      />
                      <span className="truncate text-[10px] leading-4 text-text">
                        {format(new Date(c.comeca), "HH:mm")} {c.titulo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
