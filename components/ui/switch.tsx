"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";
import styles from "./switch.module.css";

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>, "size"> {
  tone?: "sage" | "neutral" | "warm";
  size?: "sm" | "default" | "lg";
  customStyle?: React.CSSProperties;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(
  (
    {
      className,
      tone = "sage",
      size = "default",
      customStyle,
      style,
      ...props
    },
    ref,
  ) => (
    <SwitchPrimitives.Root
      className={cn(
        styles.root,
        tone === "sage" && styles.toneSage,
        tone === "neutral" && styles.toneNeutral,
        tone === "warm" && styles.toneWarm,
        size === "sm" && styles.sizeSm,
        size === "default" && styles.sizeDefault,
        size === "lg" && styles.sizeLg,
        className,
      )}
      style={{ ...customStyle, ...style }}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb className={styles.thumb} />
    </SwitchPrimitives.Root>
  ),
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
