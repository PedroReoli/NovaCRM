"use client";

import * as React from "react";
import {
  CalendarDots,
  Clock,
  CloudCheck,
  SquaresFour,
} from "@phosphor-icons/react";
import styles from "./AgendaSubNav.module.css";

export type AbaAgenda = "geral" | "grade" | "historico" | "google";

interface AgendaSubNavProps {
  activeTab: AbaAgenda;
  onChangeTab: (tab: AbaAgenda) => void;
  totalCompromissos?: number;
  googleConectado?: boolean;
}

export function AgendaSubNav({
  activeTab,
  onChangeTab,
  totalCompromissos = 0,
  googleConectado = false,
}: AgendaSubNavProps) {
  return (
    <nav
      data-testid="agenda-subnav"
      aria-label="Navegação interna da Agenda"
      className={styles.subnavContainer}
    >
      <div className={styles.tabList} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "geral"}
          data-testid="subnav-tab-geral"
          className={`${styles.tabButton} ${activeTab === "geral" ? styles.tabButtonActive : ""}`}
          onClick={() => onChangeTab("geral")}
        >
          <SquaresFour size={16} weight={activeTab === "geral" ? "bold" : "regular"} />
          <span>Visão Geral</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "grade"}
          data-testid="subnav-tab-grade"
          className={`${styles.tabButton} ${activeTab === "grade" ? styles.tabButtonActive : ""}`}
          onClick={() => onChangeTab("grade")}
        >
          <CalendarDots size={16} weight={activeTab === "grade" ? "bold" : "regular"} />
          <span>Grade da Semana</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "historico"}
          data-testid="subnav-tab-historico"
          className={`${styles.tabButton} ${activeTab === "historico" ? styles.tabButtonActive : ""}`}
          onClick={() => onChangeTab("historico")}
        >
          <Clock size={16} weight={activeTab === "historico" ? "bold" : "regular"} />
          <span>Histórico & Pendências</span>
          {totalCompromissos > 0 ? (
            <span
              className={`${styles.badge} ${activeTab === "historico" ? "" : styles.badgeInactive}`}
            >
              {totalCompromissos}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "google"}
          data-testid="subnav-tab-google"
          className={`${styles.tabButton} ${activeTab === "google" ? styles.tabButtonActive : ""}`}
          onClick={() => onChangeTab("google")}
        >
          <CloudCheck size={16} weight={activeTab === "google" ? "bold" : "regular"} />
          <span>Google Calendar</span>
          {googleConectado ? (
            <span
              className={`${styles.badge} ${activeTab === "google" ? "" : styles.badgeInactive}`}
              title="Sincronização ativa"
            >
              Ativo
            </span>
          ) : null}
        </button>
      </div>
    </nav>
  );
}
