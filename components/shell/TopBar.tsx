"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./TopBar.module.css";
import { AlertsBell } from "./AlertsBell";
import { MobileSidebar } from "./MobileSidebar";
import { TenantSwitcher } from "./TenantSwitcher";
import { UserMenu } from "./UserMenu";
import { SearchTrigger } from "./SearchTrigger";

export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "translucent" | "solid" | "minimal";
  tone?: "default" | "warm" | "surface";
  borderStyle?: "default" | "subtle" | "none";
  density?: "compact" | "default" | "spacious";
  customStyle?: React.CSSProperties;
}

export function TopBar({
  className,
  variant = "default",
  tone = "default",
  borderStyle = "default",
  density = "default",
  customStyle,
  style,
  children,
  ...props
}: TopBarProps) {
  return (
    <header
      style={{ ...customStyle, ...style }}
      className={cn(
        styles.topbar,
        variant === "default" && styles.variantDefault,
        variant === "translucent" && styles.variantTranslucent,
        variant === "solid" && styles.variantSolid,
        variant === "minimal" && styles.variantMinimal,
        tone === "warm" && styles.toneWarm,
        tone === "surface" && styles.toneSurface,
        borderStyle === "default" && styles.borderDefault,
        borderStyle === "subtle" && styles.borderSubtle,
        borderStyle === "none" && styles.borderNone,
        density === "compact" && styles.densityCompact,
        density === "default" && styles.densityDefault,
        density === "spacious" && styles.densitySpacious,
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <div className={styles.leftSlot}>
            <MobileSidebar />
            <TenantSwitcher />
          </div>
          <div className={styles.centerSlot}>
            <SearchTrigger />
          </div>
          <div className={styles.rightSlot}>
            <AlertsBell />
            <UserMenu />
          </div>
        </>
      )}
    </header>
  );
}
