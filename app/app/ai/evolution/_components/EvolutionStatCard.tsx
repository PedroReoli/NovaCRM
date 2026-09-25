"use client";

import * as React from "react";
import styles from "./EvolutionStatCard.module.css";

interface EvolutionStatCardProps {
  rotulo: string;
  valor: string;
  significa: string;
}

export function EvolutionStatCard({ rotulo, valor, significa }: EvolutionStatCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{rotulo}</p>
      <p className={styles.value}>{valor}</p>
      <p className={styles.meaning}>{significa}</p>
    </div>
  );
}
