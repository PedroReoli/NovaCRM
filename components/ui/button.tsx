import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import styles from "./button.module.css";

/**
 * Button — Minimal Warm Greige & Sage (NovaCRM / ReoliCode)
 * Totalmente adaptável via props tipadas com folha de estilo desacoplada.
 */
const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      primary: styles.variantPrimary,
      default: styles.variantPrimary,
      secondary: styles.variantSecondary,
      outline: styles.variantOutline,
      ghost: styles.variantGhost,
      minimal: styles.variantMinimal,
      destructive: styles.variantDestructive,
      link: styles.variantLink,
    },
    size: {
      sm: styles.sizeSm,
      default: styles.sizeDefault,
      md: styles.sizeMd,
      lg: styles.sizeLg,
      icon: styles.sizeIcon,
    },
    tone: {
      sage: styles.toneSage,
      neutral: styles.toneNeutral,
      subtle: styles.toneSubtle,
      warm: styles.toneWarm,
    },
    density: {
      compact: styles.densityCompact,
      default: "",
      spacious: styles.densitySpacious,
    },
    radius: {
      none: styles.radiusNone,
      sm: styles.radiusSm,
      md: styles.radiusMd,
      lg: styles.radiusLg,
      full: styles.radiusFull,
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
    radius: "sm",
    density: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  customStyle?: React.CSSProperties;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      tone,
      density,
      radius,
      asChild = false,
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      fontFamily,
      fontSize,
      fontWeight,
      customStyle,
      style,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    const mergedStyle: React.CSSProperties = {
      ...(fontFamily ? { fontFamily } : {}),
      ...(fontSize ? { fontSize } : {}),
      ...(fontWeight ? { fontWeight } : {}),
      ...customStyle,
      ...style,
    };

    const combinedClassName = cn(
      buttonVariants({ variant, size, tone, density, radius }),
      fullWidth && styles.fullWidth,
      isDisabled && styles.disabled,
      className,
    );

    if (asChild) {
      return (
        <Slot
          ref={ref}
          style={Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined}
          className={combinedClassName}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        style={Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined}
        className={combinedClassName}
        {...props}
      >
        {isLoading && (
          <span
            className={styles.loadingSpinner}
            aria-hidden="true"
            data-testid="button-spinner"
          />
        )}
        {!isLoading && leftIcon && (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
