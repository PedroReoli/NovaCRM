"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { BarraDeProgressoNavegacao } from "@/components/shell/BarraDeProgressoNavegacao";
import { useSinalDePresenca } from "@/hooks/atendimento/useSinalDePresenca";
import { useInboundMessageAlerts } from "@/hooks/notifications/useInboundMessageAlerts";
import { useInboundCallAlerts } from "@/hooks/calls/useInboundCallAlerts";
import { useCrmAlerts } from "@/hooks/notifications/useCrmAlerts";
import { useNotifyOpenFromServiceWorker } from "@/lib/notifications/notify_open";
import { estiloDaReserva, useOcupacaoDoRodape } from "@/lib/ui/rodape-ocupado";
import { cn } from "@/lib/utils";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  sidebarCollapsed: boolean;
  podeAtender: boolean;
  children: ReactNode;
  sidebarTone?: "default" | "warm" | "minimal";
  topBarVariant?: "default" | "translucent" | "solid" | "minimal";
  topBarTone?: "default" | "warm" | "surface";
  contentPadding?: "compact" | "default" | "spacious" | "none";
  customStyle?: React.CSSProperties;
}

export function AppShell({
  sidebarCollapsed,
  podeAtender,
  children,
  sidebarTone = "default",
  topBarVariant = "default",
  topBarTone = "default",
  contentPadding = "default",
  customStyle,
}: AppShellProps) {
  useInboundMessageAlerts();
  useInboundCallAlerts();
  useCrmAlerts();
  useNotifyOpenFromServiceWorker();
  useSinalDePresenca(podeAtender);
  const ocupacaoDoRodape = useOcupacaoDoRodape();

  const mergedMainStyle = {
    ...estiloDaReserva(ocupacaoDoRodape),
  };

  return (
    <div style={customStyle} className={styles.shell}>
      <BarraDeProgressoNavegacao />
      <div className={styles.sidebarWrapper}>
        <Sidebar collapsed={sidebarCollapsed} tone={sidebarTone} />
      </div>
      <div className={styles.contentWrapper}>
        <TopBar variant={topBarVariant} tone={topBarTone} />
        <main
          className={cn(
            styles.main,
            contentPadding === "default" && styles.paddingDefault,
            contentPadding === "compact" && styles.paddingCompact,
            contentPadding === "spacious" && styles.paddingSpacious,
            contentPadding === "none" && styles.paddingNone,
          )}
          style={mergedMainStyle}
          data-rodape-ocupado={ocupacaoDoRodape}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
