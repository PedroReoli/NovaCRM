"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";
import styles from "./separator.module.css";

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  tone?: "default" | "subtle" | "strong" | "sage";
  customStyle?: React.CSSProperties;
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      tone = "default",
      customStyle,
      style,
      ...props
    },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      style={{ ...customStyle, ...style }}
      className={cn(
        styles.separator,
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        tone === "subtle" && styles.toneSubtle,
        tone === "strong" && styles.toneStrong,
        tone === "sage" && styles.toneSage,
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
