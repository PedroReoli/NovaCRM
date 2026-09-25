import * as React from "react";
import { useT } from "@/hooks/i18n/useT";
import { Button } from "@/components/ui/button";
import {
  TETO_DE_LEMBRETES_EXTRAS,
  deMinutos,
  desempacotarLembretes,
  minutosLivres,
  paraMinutos,
  type UnidadeDeAntecedencia,
} from "@/lib/agenda/lembretes";
import type { CartaoDeLembrete, TipoRow } from "./types";

export function LembreteDoCompromisso({ tipo }: { tipo: TipoRow }) {
  const t = useT();
  const [ligado, setLigado] = React.useState(tipo.reminder_enabled);
  const [cartoes, setCartoes] = React.useState<CartaoDeLembrete[]>(() =>
    desempacotarLembretes({
      reminder_minutes_before: tipo.reminder_minutes_before,
      reminder_extra_offsets_minutes: tipo.reminder_extra_offsets_minutes,
      reminder_body: tipo.reminder_body,
      reminder_bodies: tipo.reminder_bodies,
    }).map((p, i) => {
      const u = deMinutos(p.minutes);
      return {
        id: `r${i + 1}`,
        quantidade: u.quantidade,
        unidade: u.unidade,
        body: p.body,
      };
    }),
  );

  const seq = React.useRef(cartoes.length);

  function minutosDe(c: CartaoDeLembrete) {
    return paraMinutos(c.quantidade, c.unidade);
  }

  function atualizar(id: string, patch: Partial<CartaoDeLembrete>) {
    setCartoes((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function mudarUnidade(id: string, unidade: UnidadeDeAntecedencia) {
    setCartoes((cs) =>
      cs.map((c) => {
        if (c.id !== id) return c;
        const minutos = minutosDe(c);
        const quantidade =
          unidade === "dias"
            ? Math.max(1, Math.round(minutos / 1440))
            : unidade === "horas"
              ? Math.max(1, Math.round(minutos / 60))
              : minutos;
        return { ...c, unidade, quantidade };
      }),
    );
  }

  const teto = 1 + TETO_DE_LEMBRETES_EXTRAS;
  const passos = cartoes.map((c) => ({ minutes: minutosDe(c), body: c.body }));

  return (
    <div className="grid gap-3 border-t border-border pt-3">
      <label className="flex items-center gap-2 text-xs text-text-muted">
        <input
          type="checkbox"
          name="reminder_enabled"
          checked={ligado}
          data-testid={`editar-lembrete-${tipo.id}`}
          onChange={(e) => setLigado(e.target.checked)}
          className="size-4 shrink-0 rounded-sm border-border accent-accent"
        />
        {t("Avisar o cliente antes do compromisso, pelo WhatsApp")}
      </label>
      <input
        type="hidden"
        name="reminder_steps"
        value={JSON.stringify(passos)}
        disabled={!ligado}
      />
      <ul className="grid gap-3">
        {cartoes.map((c, i) => {
          const min = c.unidade === "dias" ? 1 : c.unidade === "horas" ? 1 : 15;
          const max = c.unidade === "dias" ? 7 : c.unidade === "horas" ? 168 : 10080;
          return (
            <li
              key={c.id}
              className="grid gap-2 rounded-md border border-border bg-surface-elevated p-3"
            >
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex min-w-22 flex-col gap-1 text-xs text-text-muted">
                  {t("Quanto antes")}
                  <input
                    type="number"
                    min={min}
                    max={max}
                    disabled={!ligado}
                    value={c.quantidade}
                    onChange={(e) => atualizar(c.id, { quantidade: Number(e.target.value) })}
                    data-testid={
                      i === 0
                        ? `editar-lembrete-minutos-${tipo.id}`
                        : `editar-lembrete-minutos-${tipo.id}-${i}`
                    }
                    className="rounded-md border border-border bg-surface p-2 text-sm text-text disabled:opacity-50"
                  />
                </label>
                <label className="flex min-w-28 flex-col gap-1 text-xs text-text-muted">
                  <span className="sr-only">{t("Unidade")}</span>
                  <select
                    disabled={!ligado}
                    value={c.unidade}
                    onChange={(e) => mudarUnidade(c.id, e.target.value as UnidadeDeAntecedencia)}
                    data-testid={
                      i === 0
                        ? `editar-lembrete-unidade-${tipo.id}`
                        : `editar-lembrete-unidade-${tipo.id}-${i}`
                    }
                    className="rounded-md border border-border bg-surface p-2 text-sm text-text disabled:opacity-50"
                  >
                    <option value="minutos">{t("minutos")}</option>
                    <option value="horas">{t("horas")}</option>
                    <option value="dias">{t("dias")}</option>
                  </select>
                </label>
                <span className="pb-2 text-xs text-text-muted">{t("antes")}</span>
                {ligado && cartoes.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    data-testid={`editar-lembrete-remover-${tipo.id}-${i}`}
                    onClick={() => setCartoes((cs) => cs.filter((x) => x.id !== c.id))}
                  >
                    {t("Remover")}
                  </Button>
                ) : null}
              </div>
              <label className="flex flex-col gap-1 text-xs text-text-muted">
                {t("Mensagem deste lembrete")}
                <textarea
                  rows={3}
                  maxLength={1000}
                  disabled={!ligado}
                  value={c.body}
                  onChange={(e) => atualizar(c.id, { body: e.target.value })}
                  placeholder={t(
                    "Oi {{nome}}! Passando pra lembrar: {{titulo}}, {{dia}} às {{hora}}.",
                  )}
                  data-testid={
                    i === 0
                      ? `editar-lembrete-texto-${tipo.id}`
                      : `editar-lembrete-texto-${tipo.id}-${i}`
                  }
                  className="rounded-md border border-border bg-surface p-2 text-sm text-text disabled:opacity-50"
                />
              </label>
            </li>
          );
        })}
      </ul>
      {ligado && cartoes.length < teto ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          data-testid={`editar-lembrete-adicionar-${tipo.id}`}
          onClick={() => {
            const u = deMinutos(minutosLivres(cartoes.map(minutosDe)));
            setCartoes((cs) => [
              ...cs,
              {
                id: `r${++seq.current}`,
                quantidade: u.quantidade,
                unidade: u.unidade,
                body: "",
              },
            ]);
          }}
        >
          {t("Adicionar lembrete")}
        </Button>
      ) : null}
      <p className="text-[11px] text-text-muted">
        {t(
          "Deixe a mensagem em branco para o texto padrão. Variáveis: {{nome}}, {{titulo}}, {{dia}}, {{hora}}, {{endereco}}.",
        )}
      </p>
    </div>
  );
}
