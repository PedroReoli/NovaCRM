"use client";

import * as React from "react";
import styles from "./EvolutionRanking.module.css";

interface EvolutionRankingProps {
  titulo: string;
  significa: string;
  contagem: Record<string, number>;
  vazio: React.ReactNode;
}

function num(n: number): string {
  return n.toLocaleString("pt-BR");
}

export function EvolutionRanking({
  titulo,
  significa,
  contagem,
  vazio,
}: EvolutionRankingProps) {
  const linhas = Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maior = linhas[0]?.[1] ?? 0;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{titulo}</h3>
      <p className={styles.meaning}>{significa}</p>
      {linhas.length === 0 ? (
        <div className="mt-4">{vazio}</div>
      ) : (
        <ul className={styles.list}>
          {linhas.map(([nome, qtd]) => (
            <li key={nome} className={styles.listItem}>
              <div className={styles.itemHeader}>
                <span className={styles.itemLabel} title={nome}>
                  {nome}
                </span>
                <span className={styles.itemValue}>{num(qtd)}</span>
              </div>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: `${maior > 0 ? Math.max(4, (qtd / maior) * 100) : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
