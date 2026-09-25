"use client";

import Link from "next/link";
import { useT } from "@/hooks/i18n/useT";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowRight, CaretDoubleLeft, CaretDoubleRight, CaretDown, Gear } from "@/lib/ui/icons";
import { cn } from "@/lib/utils";
import { toggleSidebar } from "@/app/actions/shell/toggleSidebar";
import { useAuth } from "@/hooks/auth/AuthProvider";
import { ConnectionHealthDot } from "@/components/connections/ConnectionHealthDot";
import { VersionFooter } from "@/components/shell/VersionFooter";
import { LogotipoDoProduto, SimboloDoProduto } from "@/components/branding/MarcaDoProduto";
import { marcaEhADoProduto } from "@/lib/branding";
import { useMarcaDaInstalacao } from "@/lib/branding/contexto";
import { GRUPO_NO_RODAPE, sidebarGroups } from "@/lib/navigation/registry";
import styles from "./Sidebar.module.css";

const CHAVE_GRUPOS_FECHADOS = "sidebar-grupos-fechados";

export interface SidebarContentProps {
  collapsed: boolean;
  showCollapseControl?: boolean;
  onNavigate?: () => void;
  tone?: "default" | "warm" | "minimal";
  customStyle?: React.CSSProperties;
}

/**
 * Navegação principal, agrupada por objetivo.
 * Minimal Warm Greige & Sage — com suporte a estilos desacoplados e props ricas.
 */
export function SidebarContent({
  collapsed,
  showCollapseControl = true,
  onNavigate,
  customStyle,
}: SidebarContentProps) {
  const t = useT();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { user, activeOrg } = useAuth();
  const todos = sidebarGroups(
    user.is_platform_admin && !user.support,
    activeOrg?.role ?? null,
    activeOrg?.interface_settings,
    activeOrg?.modulos_ligados ?? [],
  );

  const grupos = todos.filter((g) => g.group.id !== GRUPO_NO_RODAPE);
  const rodape = todos.find((g) => g.group.id === GRUPO_NO_RODAPE)?.group.hub;

  const [gruposFechados, setGruposFechados] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(CHAVE_GRUPOS_FECHADOS);
      if (salvo) setGruposFechados(new Set(JSON.parse(salvo) as string[]));
    } catch {
      // Storage bloqueado
    }
  }, []);

  function toggleGrupo(id: string) {
    setGruposFechados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(CHAVE_GRUPOS_FECHADOS, JSON.stringify([...next]));
      } catch {
        // Ignora falhas pontuais de escrita
      }
      return next;
    });
  }

  const brand = useMarcaDaInstalacao();
  const nome = activeOrg?.marca?.nome ?? brand.name;
  const logo = activeOrg?.marca?.logoUrl || brand.logoUrl;
  const marcaDoProduto = marcaEhADoProduto({ name: nome, logoUrl: logo ?? null });

  return (
    <div style={customStyle} className="flex h-full flex-col">
      <div
        className={cn(
          styles.header,
          collapsed ? styles.headerCentered : styles.headerStart,
        )}
      >
        {logo && !collapsed ? (
          <div className="rounded-md dark:bg-white dark:px-2 dark:py-1 dark:shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt={nome} className="h-7 w-auto max-w-[10rem] object-contain" />
          </div>
        ) : marcaDoProduto ? (
          collapsed ? (
            <SimboloDoProduto nome={nome} className="h-8 w-8" />
          ) : (
            <LogotipoDoProduto nome={nome} className="h-8 w-auto" />
          )
        ) : (
          <span className={cn("font-semibold tracking-tight", collapsed && "sr-only")}>{nome}</span>
        )}
        {collapsed && !marcaDoProduto && (
          <span aria-hidden className="text-lg font-bold text-accent">
            {[...nome][0]?.toUpperCase() ?? brand.initial}
          </span>
        )}
      </div>

      <nav className={styles.nav} aria-label={t("Navegação principal")}>
        {grupos.map(({ group, items }) => {
          const tituloId = `nav-grupo-${group.id}`;
          const aberto = collapsed || !gruposFechados.has(group.id);
          return (
            <div key={group.id} className="space-y-1">
              {collapsed ? (
                <div aria-hidden className="mx-2 border-t border-border first:hidden" />
              ) : (
                <h2 id={tituloId}>
                  <button
                    type="button"
                    onClick={() => toggleGrupo(group.id)}
                    aria-expanded={aberto}
                    className={styles.groupTitleBtn}
                  >
                    {t(group.label)}
                    <CaretDown
                      size={12}
                      weight="bold"
                      className={cn(
                        "shrink-0 text-text-subtle transition-transform",
                        !aberto && "-rotate-90",
                      )}
                      aria-hidden
                    />
                  </button>
                </h2>
              )}
              {aberto && (
                <ul
                  aria-labelledby={collapsed ? undefined : tituloId}
                  aria-label={collapsed ? t(group.label) : undefined}
                  className="space-y-1"
                >
                  {items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={collapsed ? t(item.label) : undefined}
                          aria-current={isActive ? "page" : undefined}
                          onClick={onNavigate}
                          className={cn(
                            styles.navItem,
                            isActive && styles.navItemActive,
                            collapsed && "justify-center px-2",
                          )}
                        >
                          <Icon size={18} aria-hidden />
                          {!collapsed && <span className="truncate">{t(item.label)}</span>}
                          {item.healthDot && <ConnectionHealthDot />}
                        </Link>
                      </li>
                    );
                  })}
                  {group.hub && (
                    <li key={`hub-${group.id}`}>
                      <Link
                        href={group.hub.href}
                        title={collapsed ? t(group.hub.label) : undefined}
                        aria-current={pathname === group.hub.href ? "page" : undefined}
                        onClick={onNavigate}
                        className={cn(
                          styles.navItem,
                          "text-xs text-text-subtle",
                          pathname === group.hub.href && styles.navItemActive,
                          collapsed && "justify-center px-2",
                        )}
                      >
                        <ArrowRight size={18} aria-hidden />
                        {!collapsed && <span className="truncate">{t(group.hub.label)}</span>}
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className={styles.footer}>
        {rodape && (
          <Link
            href={rodape.href}
            title={collapsed ? t(rodape.label) : undefined}
            aria-current={pathname.startsWith(rodape.href) ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              styles.navItem,
              pathname.startsWith(rodape.href) && styles.navItemActive,
              collapsed && "justify-center px-2",
            )}
          >
            <Gear size={18} aria-hidden />
            {!collapsed && <span className="truncate">{t(rodape.label)}</span>}
          </Link>
        )}
        <VersionFooter collapsed={collapsed} onNavigate={onNavigate} />
        {showCollapseControl && (
          <button
            type="button"
            onClick={() => startTransition(() => toggleSidebar(collapsed))}
            disabled={isPending}
            className={cn(
              styles.collapseBtn,
              collapsed && "justify-center px-2",
            )}
            aria-label={collapsed ? t("Expandir sidebar") : t("Recolher sidebar")}
          >
            {collapsed ? (
              <CaretDoubleRight size={14} aria-hidden />
            ) : (
              <CaretDoubleLeft size={14} aria-hidden />
            )}
            {!collapsed && <span>{t("Recolher")}</span>}
          </button>
        )}
      </div>
    </div>
  );
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed: boolean;
  tone?: "default" | "warm" | "minimal";
  borderStyle?: "default" | "subtle" | "none";
  customStyle?: React.CSSProperties;
}

export function Sidebar({
  collapsed,
  tone = "default",
  borderStyle = "default",
  customStyle,
  style,
  className,
  ...props
}: SidebarProps) {
  return (
    <aside
      style={{ ...customStyle, ...style }}
      className={cn(
        styles.sidebar,
        collapsed ? styles.collapsed : styles.expanded,
        tone === "default" && styles.toneDefault,
        tone === "warm" && styles.toneWarm,
        tone === "minimal" && styles.toneMinimal,
        borderStyle === "default" && styles.borderDefault,
        borderStyle === "subtle" && styles.borderSubtle,
        borderStyle === "none" && styles.borderNone,
        className,
      )}
      {...props}
    >
      <SidebarContent collapsed={collapsed} tone={tone} />
    </aside>
  );
}
