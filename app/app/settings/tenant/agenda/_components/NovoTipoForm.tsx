import * as React from "react";
import { useT } from "@/hooks/i18n/useT";
import { Button } from "@/components/ui/button";
import { CATEGORIAS, LOCAIS, type Rascunho } from "./types";

interface NovoTipoFormProps {
  criando: boolean;
  setCriando: (b: boolean) => void;
  rascunho: Rascunho;
  setRascunho: React.Dispatch<React.SetStateAction<Rascunho>>;
  salvando: boolean;
  pessoas: Array<{ id: string; papel: string; nome: string }>;
  onCriar: (e: React.FormEvent) => void;
}

export function NovoTipoForm({
  criando,
  setCriando,
  rascunho,
  setRascunho,
  salvando,
  pessoas,
  onCriar,
}: NovoTipoFormProps) {
  const t = useT();

  if (!criando) {
    return (
      <Button size="sm" data-testid="abrir-novo-tipo" onClick={() => setCriando(true)}>
        {t("Novo tipo de agendamento")}
      </Button>
    );
  }

  return (
    <form
      data-testid="form-novo-tipo"
      className="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2"
      onSubmit={onCriar}
    >
      <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">
        {t("Nome")}
        <input
          data-testid="novo-tipo-nome"
          required
          minLength={2}
          value={rascunho.name}
          onChange={(e) => setRascunho((r) => ({ ...r, name: e.target.value }))}
          placeholder={t("Retorno")}
          className="rounded-md border border-border bg-surface-elevated p-2 text-sm text-text outline-hidden focus:border-border-strong"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">
        {t("Categoria")}
        <select
          data-testid="novo-tipo-categoria"
          value={rascunho.category}
          onChange={(e) => setRascunho((r) => ({ ...r, category: e.target.value }))}
          className="rounded-md border border-border bg-surface-elevated p-2 text-sm text-text outline-hidden focus:border-border-strong"
        >
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>
              {t(c.rotulo)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">
        {t("Duração (minutos)")}
        <input
          data-testid="novo-tipo-duracao"
          type="number"
          min={5}
          max={1440}
          value={rascunho.duration_minutes}
          onChange={(e) =>
            setRascunho((r) => ({ ...r, duration_minutes: Number(e.target.value) }))
          }
          className="rounded-md border border-border bg-surface-elevated p-2 text-sm text-text outline-hidden focus:border-border-strong"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">
        {t("Onde acontece")}
        <select
          data-testid="novo-tipo-local"
          value={rascunho.location_kind}
          onChange={(e) => setRascunho((r) => ({ ...r, location_kind: e.target.value }))}
          className="rounded-md border border-border bg-surface-elevated p-2 text-sm text-text outline-hidden focus:border-border-strong"
        >
          {LOCAIS.map((l) => (
            <option key={l.valor} value={l.valor}>
              {t(l.rotulo)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-text-muted sm:col-span-2">
        {t("Quem atende (sem isto, não há horário para oferecer)")}
        <select
          data-testid="novo-tipo-dono"
          value={rascunho.default_owner_user_id}
          onChange={(e) =>
            setRascunho((r) => ({ ...r, default_owner_user_id: e.target.value }))
          }
          className="rounded-md border border-border bg-surface-elevated p-2 text-sm text-text outline-hidden focus:border-border-strong"
        >
          <option value="">{t("Definir depois")}</option>
          {pessoas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </label>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setCriando(false)}>
          {t("Cancelar")}
        </Button>
        <Button type="submit" size="sm" data-testid="salvar-novo-tipo" disabled={salvando}>
          {salvando ? t("Criando…") : t("Criar tipo")}
        </Button>
      </div>
    </form>
  );
}
