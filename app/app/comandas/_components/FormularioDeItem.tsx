"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";
import { parseReaisToCents } from "@/lib/money";
import type { Tipo } from "../_types";
import styles from "./FormularioDeItem.module.css";

interface FormularioDeItemProps {
  tipos: Tipo[];
  onIncluir: (corpo: Record<string, unknown>) => void;
  pendente: boolean;
}

export function FormularioDeItem({ tipos, onIncluir, pendente }: FormularioDeItemProps) {
  const t = useT();
  const [descricao, setDescricao] = React.useState("");
  const [preco, setPreco] = React.useState("");
  const [tipoId, setTipoId] = React.useState("");

  const cents = parseReaisToCents(preco);
  const podeIncluir = descricao.trim().length > 0 && cents !== null && !pendente;

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (!podeIncluir) return;
        onIncluir({
          description: descricao.trim(),
          unit_price_cents: cents,
          event_type_id: tipoId || null,
          quantity: 1,
        });
        setDescricao("");
        setPreco("");
        setTipoId("");
      }}
    >
      <label className={styles.label}>
        {t("Serviço")}
        <select
          value={tipoId}
          data-testid="item-servico"
          onChange={(e) => {
            setTipoId(e.target.value);
            const escolhido = tipos.find((x) => x.id === e.target.value);
            if (escolhido?.name) setDescricao(escolhido.name);
            if (escolhido?.default_price_cents != null && preco.trim() === "") {
              setPreco((escolhido.default_price_cents / 100).toFixed(2));
            }
          }}
          className={styles.select}
        >
          <option value="">{t("Avulso")}</option>
          {tipos.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.label}>
        {t("Descrição")}
        <input
          value={descricao}
          data-testid="item-descricao"
          onChange={(e) => setDescricao(e.target.value)}
          className={styles.input}
        />
      </label>

      <label className={styles.label}>
        {t("Valor")}
        <input
          value={preco}
          inputMode="decimal"
          placeholder="0,00"
          data-testid="item-valor"
          onChange={(e) => setPreco(e.target.value)}
          className={styles.inputPrice}
        />
      </label>

      <Button type="submit" disabled={!podeIncluir} data-testid="incluir-item">
        {t("Incluir")}
      </Button>
    </form>
  );
}
