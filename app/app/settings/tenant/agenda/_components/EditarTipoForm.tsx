import * as React from "react";
import { useT } from "@/hooks/i18n/useT";
import { Button } from "@/components/ui/button";
import { LembreteDoCompromisso } from "./LembreteDoCompromisso";
import type { TipoRow } from "./types";

interface EditarTipoFormProps {
  tipo: TipoRow;
  pessoas: Array<{ id: string; papel: string; nome: string }>;
  salvando: boolean;
  onSubmit: (tipoId: string, dados: FormData) => Promise<boolean>;
}

export function EditarTipoForm({
  tipo,
  pessoas,
  salvando,
  onSubmit,
}: EditarTipoFormProps) {
  const t = useT();

  return (
    <form
      data-testid={`form-editar-${tipo.id}`}
      className="mt-3 flex flex-col gap-3 border-t border-border pt-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        await onSubmit(tipo.id, dados);
      }}
    >
      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_minmax(0,18rem)]">
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Nome
          <input
            name="name"
            defaultValue={tipo.name}
            data-testid={`editar-nome-${tipo.id}`}
            className="rounded-md border border-border bg-surface-elevated p-2 text-sm text-text"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          {t("Duração")}
          <input
            name="duration_minutes"
            type="number"
            min={5}
            max={1440}
            defaultValue={tipo.duration_minutes}
            data-testid={`editar-duracao-${tipo.id}`}
            className="rounded-md border border-border bg-surface-elevated p-2 text-sm text-text"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          {t("Quem atende")}
          <select
            name="default_owner_user_id"
            defaultValue={tipo.default_owner_user_id ?? ""}
            data-testid={`editar-dono-${tipo.id}`}
            className="rounded-md border border-border bg-surface-elevated p-2 text-sm text-text"
          >
            <option value="">{t("Sem responsável")}</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          {t("Preço padrão")}
          <input
            name="default_price_cents"
            type="text"
            inputMode="decimal"
            placeholder={t("digite na hora")}
            defaultValue={
              tipo.default_price_cents === null
                ? ""
                : (tipo.default_price_cents / 100).toFixed(2)
            }
            data-testid={`editar-preco-${tipo.id}`}
            className="rounded-md border border-border bg-surface-elevated p-2 text-sm text-text"
          />
          <span className="text-[11px] text-text-muted">
            {t("Opcional. Vira o valor sugerido na comanda, e pode ser mudado lá.")}
          </span>
        </label>
      </div>

      <LembreteDoCompromisso tipo={tipo} />

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          data-testid={`salvar-${tipo.id}`}
          disabled={salvando}
        >
          {salvando ? t("Salvando…") : t("Salvar")}
        </Button>
      </div>
    </form>
  );
}
