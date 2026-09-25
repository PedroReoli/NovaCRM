import { format } from "date-fns";
import type { Locale } from "date-fns";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "@/lib/ui/icons";
import { useT } from "@/hooks/i18n/useT";
import { cn } from "@/lib/utils";
import type { HorarioLivre, Pessoa } from "../tipos";

interface MarcadoSucessoProps {
  marcado: HorarioLivre;
  tipo: string;
  duracaoMin: number;
  responsavel: Pessoa;
  quemSeraAtendido?: { nome: string; aceitaMensagem: boolean };
  localeDaData: Locale;
  onMarcarOutro: () => void;
  onVerNaAgenda?: (instante: string) => void;
  className?: string;
}

export function MarcadoSucesso({
  marcado,
  tipo,
  duracaoMin,
  responsavel,
  quemSeraAtendido,
  localeDaData,
  onMarcarOutro,
  onVerNaAgenda,
  className,
}: MarcadoSucessoProps) {
  const t = useT();

  return (
    <div
      data-testid="painel-de-marcacao"
      data-tempo="marcado"
      className={cn("rounded-lg border border-border bg-surface p-6", className)}
    >
      <div className="flex flex-col items-center text-center">
        <CheckCircle size={32} weight="duotone" className="text-success" aria-hidden />
        <h3 className="mt-3 text-base font-semibold">{t("Marcado.")}</h3>
        <p className="mt-1 text-sm text-text-muted">
          {format(new Date(marcado.instante), t("EEEE, d 'de' MMMM 'às' HH:mm"), {
            locale: localeDaData,
          })}
        </p>
        <p className="mt-0.5 text-xs text-text-subtle">
          {t(tipo)} · {duracaoMin} {t("min · com")} {responsavel.nome}
        </p>
        {quemSeraAtendido && !quemSeraAtendido.aceitaMensagem && (
          <p data-testid="aviso-sem-lembrete-no-resumo" className="mt-2 text-xs text-warning">
            {t("Sem lembrete automático —")} {quemSeraAtendido.nome}{" "}
            {t("pediu para não receber mensagens.")}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <Button variant="outline" size="sm" onClick={onMarcarOutro}>
            {t("Marcar outro")}
          </Button>
          {onVerNaAgenda && (
            <Button
              size="sm"
              data-testid="ver-na-agenda"
              onClick={() => onVerNaAgenda(marcado.instante)}
            >
              {t("Ver na agenda")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
