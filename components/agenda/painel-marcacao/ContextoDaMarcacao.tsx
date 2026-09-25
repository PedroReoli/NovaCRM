import { Clock, MapPin } from "@/lib/ui/icons";
import { useT } from "@/hooks/i18n/useT";
import { AvatarDaPessoa } from "../AvatarDaPessoa";
import type { Pessoa } from "../tipos";

interface ContextoDaMarcacaoProps {
  responsavel: Pessoa;
  tipo: string;
  duracaoMin: number;
  local?: string;
  fuso?: string;
}

export function ContextoDaMarcacao({
  responsavel,
  tipo,
  duracaoMin,
  local,
  fuso,
}: ContextoDaMarcacaoProps) {
  const t = useT();

  return (
    <aside
      data-testid="contexto-da-marcacao"
      className="shrink-0 border-b border-border bg-surface-elevated/50 p-4 lg:w-[280px] lg:border-b-0 lg:border-r"
    >
      <div className="flex items-center gap-2">
        <AvatarDaPessoa pessoa={responsavel} tamanho="sm" />
        <span className="truncate text-sm font-semibold">{responsavel.nome}</span>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-tight">{tipo}</h3>
      <dl className="mt-3 space-y-2 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Clock size={14} aria-hidden />
          <dd className="tabular-nums">{duracaoMin} minutos</dd>
        </div>
        {local ? (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} aria-hidden />
            <dd className="truncate">{local}</dd>
          </div>
        ) : null}
      </dl>
      {fuso ? (
        <p className="mt-4 border-t border-border pt-3 text-[11px] leading-4 text-text-subtle">
          {t("Horários no fuso")} <span className="font-mono">{fuso.replace("_", " ")}</span>.
        </p>
      ) : null}
    </aside>
  );
}
