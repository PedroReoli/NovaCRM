"use client";

import * as React from "react";
import { useT } from "@/hooks/i18n/useT";
import styles from "./ResumoImportacao.module.css";

export interface ResumoDaImportacao {
  total_linhas: number;
  criados: number;
  atualizados: number;
  erros: Array<{ linha: number; motivo: string }>;
  colunas_ignoradas: string[];
}

interface ResumoImportacaoProps {
  resumo: ResumoDaImportacao;
  onClose: () => void;
}

export function ResumoImportacao({ resumo, onClose }: ResumoImportacaoProps) {
  const t = useT();

  return (
    <div className={styles.container} data-testid="resumo-importacao">
      <p className={styles.summaryText}>
        {resumo.criados} {t("novos")} · {resumo.atualizados} {t("atualizados")} ·{" "}
        {resumo.total_linhas} {t("linhas na planilha")}
      </p>
      {resumo.colunas_ignoradas.length > 0 ? (
        <p className={styles.ignoredText}>
          {t("Não usei estas colunas:")} {resumo.colunas_ignoradas.join(", ")}.
        </p>
      ) : null}
      {resumo.erros.length > 0 ? (
        <div className={styles.errorSection}>
          <p className={styles.errorTitle}>{t("Linhas que não entraram:")}</p>
          <ul className={styles.errorList}>
            {resumo.erros.slice(0, 20).map((e) => (
              <li key={`${e.linha}-${e.motivo}`}>
                {t("Linha")} {e.linha}: {e.motivo}
              </li>
            ))}
          </ul>
          {resumo.erros.length > 20 ? (
            <p className="mt-1 text-muted-foreground">
              {t("…e mais")} {resumo.erros.length - 20}.
            </p>
          ) : null}
        </div>
      ) : null}
      <button className={styles.closeButton} onClick={onClose}>
        {t("Fechar")}
      </button>
    </div>
  );
}
