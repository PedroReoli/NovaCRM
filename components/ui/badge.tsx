import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import styles from "./badge.module.css";

const badgeVariants = cva(styles.badge, {
  variants: {
    variant: {
      default: styles.variantDefault,
      neutral: styles.variantNeutral,
      minimal: styles.variantMinimal,
      outline: styles.variantOutline,
      success: styles.variantSuccess,
      warning: styles.variantWarning,
      error: styles.variantError,
      info: styles.variantInfo,
      // shadcn compat aliases
      secondary: styles.variantNeutral,
      destructive: styles.variantError,
    },
    tone: {
      sage: styles.toneSage,
      neutral: styles.toneNeutral,
      subtle: styles.toneSubtle,
      warm: styles.toneWarm,
    },
    size: {
      sm: styles.sizeSm,
      default: styles.sizeDefault,
      lg: styles.sizeLg,
    },
    density: {
      compact: styles.densityCompact,
      default: "",
    },
    radius: {
      none: styles.radiusNone,
      sm: styles.radiusSm,
      md: styles.radiusMd,
      full: styles.radiusFull,
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    radius: "full",
    density: "default",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  customStyle?: React.CSSProperties;
}

function Badge({
  className,
  variant,
  tone,
  size,
  density,
  radius,
  dot = false,
  leftIcon,
  rightIcon,
  customStyle,
  style,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      style={{ ...customStyle, ...style }}
      className={cn(badgeVariants({ variant, tone, size, density, radius }), className)}
      {...props}
    >
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </div>
  );
}

export { Badge, badgeVariants };
