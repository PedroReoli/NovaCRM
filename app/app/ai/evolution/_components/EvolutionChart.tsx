"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTagDeIdioma } from "@/hooks/i18n/useLocaleDeData";
import { useT } from "@/hooks/i18n/useT";
import styles from "./EvolutionChart.module.css";

interface EvolutionChartProps {
  titulo: string;
  significa: string;
  dados: Array<{ day: string; value: number }>;
  cor: string;
  vazio: React.ReactNode;
}

function num(n: number): string {
  return n.toLocaleString("pt-BR");
}

function diaCurto(s: string, idioma: string): string {
  return new Date(`${s}T00:00:00Z`).toLocaleDateString(idioma, {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

export function EvolutionChart({
  titulo,
  significa,
  dados,
  cor,
  vazio,
}: EvolutionChartProps) {
  const tagDoIdioma = useTagDeIdioma();
  const t = useT();
  const temDado = dados.some((p) => p.value > 0);
  const total = dados.reduce((acc, p) => acc + p.value, 0);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{titulo}</h3>
      <p className={styles.meaning}>{significa}</p>
      {!temDado ? (
        <div className="mt-4">{vazio}</div>
      ) : (
        <>
          <p className={styles.totalValue}>
            {num(total)}{" "}
            <span className={styles.totalSubtext}>{t("no período")}</span>
          </p>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={dados} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="day"
                  tickFormatter={(v) => diaCurto(v, tagDoIdioma)}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={36}
                />
                <Tooltip
                  formatter={(v) => [num(Number(v)), t("no dia")]}
                  labelFormatter={(l) => diaCurto(String(l), tagDoIdioma)}
                  contentStyle={{
                    borderRadius: "8px",
                    fontSize: "12px",
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                  }}
                />
                <Line type="monotone" dataKey="value" stroke={cor} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
