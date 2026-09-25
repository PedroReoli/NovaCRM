import Link from "next/link";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { useT } from "@/hooks/i18n/useT";

export function AvisoDeJornadaNaoPublicada({ quemLeEhODono }: { quemLeEhODono: boolean }) {
  const t = useT();

  return (
    <>
      <p className="text-sm font-semibold text-text">
        {quemLeEhODono
          ? t("Você ainda não publicou seus horários de atendimento")
          : t("A jornada de atendimento ainda não foi publicada")}
      </p>
      <p className="mt-1 text-xs leading-4 text-text-muted">
        {quemLeEhODono
          ? t("Sem eles ninguém consegue marcar — nem você, nem o agente.")
          : t("Sem eles ninguém consegue marcar — nem quem atende, nem o agente.")}
      </p>
    </>
  );
}

interface AvisosDoPainelProps {
  motivoDoBloqueio: "sem-jornada" | "erro" | "sem-vaga" | null;
  responsavelNome: string;
  mes: Date;
  localeDaData: Locale;
  googleCoberturaParcial?: boolean;
  fusoSuposto?: boolean;
  fuso?: string;
  fontesDefasadas?: Array<{ nome?: string; desde?: string }>;
}

export function AvisosDoPainel({
  motivoDoBloqueio,
  responsavelNome,
  mes,
  localeDaData,
  googleCoberturaParcial,
  fusoSuposto,
  fuso,
  fontesDefasadas,
}: AvisosDoPainelProps) {
  const t = useT();

  return (
    <>
      {motivoDoBloqueio === "sem-jornada" && (
        <div
          data-testid="sem-jornada-publicada"
          className="mb-3 rounded-sm border border-warning/40 bg-warning-bg p-3"
        >
          <AvisoDeJornadaNaoPublicada quemLeEhODono={responsavelNome === "Você"} />
          <Link
            href="/app/team?aba=atendimento"
            data-testid="ir-configurar-horarios"
            className="mt-2 inline-block text-xs font-medium text-accent underline underline-offset-2 hover:text-accent-strong"
          >
            {t("Configurar meus horários de atendimento")}
          </Link>
        </div>
      )}

      {motivoDoBloqueio === "erro" && (
        <div
          data-testid="motivo-do-bloqueio"
          data-motivo="erro"
          className="mb-3 rounded-sm border border-warning/40 bg-warning-bg p-3"
        >
          <p className="text-sm font-semibold text-text">
            {t("Não consegui carregar os horários")}
          </p>
          <p className="mt-1 text-xs leading-4 text-text-muted">
            {t(
              "Os dias ficam bloqueados até eu conseguir — é mais seguro que oferecer um horário que talvez não exista. Numa instalação nova, isso costuma ser a jornada de atendimento que ainda não foi publicada.",
            )}
          </p>
          <Link
            href="/app/team?aba=atendimento"
            data-testid="ir-configurar-horarios"
            className="mt-2 inline-block text-xs font-medium text-accent underline underline-offset-2 hover:text-accent-strong"
          >
            {t("Configurar meus horários de atendimento")}
          </Link>
        </div>
      )}

      {motivoDoBloqueio === "sem-vaga" && (
        <div
          data-testid="motivo-do-bloqueio"
          data-motivo="sem-vaga"
          className="mb-3 rounded-sm border border-border bg-surface-sunken p-3"
        >
          <p className="text-sm font-semibold text-text">
            {t("Nenhum horário livre em")} {format(mes, "MMMM", { locale: localeDaData })}
          </p>
          <p className="mt-1 text-xs leading-4 text-text-muted">
            {t("Não há horário livre publicado neste mês.")}
          </p>
        </div>
      )}

      {googleCoberturaParcial && (
        <p role="status" className="mb-2 text-xs text-warning">
          {t("Ocupação do Google ainda não verificada neste período.")}
        </p>
      )}

      {fusoSuposto && (
        <p data-testid="fuso-suposto" className="mb-2 text-[11px] leading-4 text-text-subtle">
          {t("Estamos supondo o fuso")}{" "}
          <span className="font-mono">{(fuso ?? "").replace("_", " ")}</span>{" "}
          {t("— ninguém escolheu ainda. O agente oferece horário usando ele.")}
        </p>
      )}

      {fontesDefasadas && fontesDefasadas.length > 0 && (
        <p data-testid="fontes-defasadas" className="mb-2 text-[11px] leading-4 text-warning">
          {fontesDefasadas.length === 1
            ? `A agenda conectada ${fontesDefasadas[0]?.nome ?? ""} não atualiza desde ${fontesDefasadas[0]?.desde ?? "algum tempo"}. Os horários dela seguem bloqueados por precaução.`
            : `${fontesDefasadas.length} agendas conectadas não estão atualizando. Os horários delas seguem bloqueados por precaução.`}
        </p>
      )}
    </>
  );
}
