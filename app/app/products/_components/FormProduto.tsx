"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";
import styles from "./FormProduto.module.css";

export interface RascunhoProduto {
  codigo: string;
  nome: string;
  marca: string;
  categoria: string;
  preco: string;
  custo: string;
  quantidade: string;
  controla_estoque: boolean;
}

interface FormProdutoProps {
  rascunho: RascunhoProduto;
  onChangeRascunho: (r: RascunhoProduto) => void;
  onSalvar: () => void;
  salvando: boolean;
}

export function FormProduto({
  rascunho,
  onChangeRascunho,
  onSalvar,
  salvando,
}: FormProdutoProps) {
  const t = useT();

  return (
    <div className={styles.container} data-testid="form-produto">
      <div className={styles.grid}>
        <label className={styles.label}>
          {t("Código")}
          <input
            value={rascunho.codigo}
            onChange={(e) => onChangeRascunho({ ...rascunho, codigo: e.target.value })}
            className={styles.input}
            data-testid="produto-codigo"
          />
        </label>
        <label className={styles.label}>
          {t("Nome")}
          <input
            value={rascunho.nome}
            onChange={(e) => onChangeRascunho({ ...rascunho, nome: e.target.value })}
            className={styles.input}
            data-testid="produto-nome"
          />
        </label>
        <label className={styles.label}>
          {t("Marca")}
          <input
            value={rascunho.marca}
            onChange={(e) => onChangeRascunho({ ...rascunho, marca: e.target.value })}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          {t("Categoria")}
          <input
            value={rascunho.categoria}
            onChange={(e) => onChangeRascunho({ ...rascunho, categoria: e.target.value })}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          {t("Preço de venda")}
          <input
            value={rascunho.preco}
            onChange={(e) => onChangeRascunho({ ...rascunho, preco: e.target.value })}
            placeholder="5.499,00"
            className={styles.input}
            data-testid="produto-preco"
          />
        </label>
        <label className={styles.label}>
          <span>
            {t("Custo")} <span className="text-muted-foreground">{t("(opcional)")}</span>
          </span>
          <input
            value={rascunho.custo}
            onChange={(e) => onChangeRascunho({ ...rascunho, custo: e.target.value })}
            placeholder="4.100,00"
            className={styles.input}
          />
          <span className={styles.helperText}>
            {t("Serve para o atendente saber até onde pode negociar. Não aparece para o cliente.")}
          </span>
        </label>
      </div>

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={rascunho.controla_estoque}
          onChange={(e) =>
            onChangeRascunho({ ...rascunho, controla_estoque: e.target.checked })
          }
          data-testid="produto-controla-estoque"
        />
        {t("Controlar estoque deste produto")}
      </label>
      {rascunho.controla_estoque ? (
        <label className="mt-2 block text-sm">
          {t("Quantidade")}
          <input
            value={rascunho.quantidade}
            onChange={(e) => onChangeRascunho({ ...rascunho, quantidade: e.target.value })}
            className={styles.stockInput}
          />
        </label>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          {t(
            "Sem controle de estoque, este produto sempre aparece como disponível para o atendente — é o certo para item sob encomenda ou fracionado.",
          )}
        </p>
      )}

      <div className={styles.actions}>
        <Button onClick={onSalvar} disabled={salvando} data-testid="salvar-produto">
          {t(salvando ? "Salvando…" : "Salvar produto")}
        </Button>
      </div>
    </div>
  );
}
