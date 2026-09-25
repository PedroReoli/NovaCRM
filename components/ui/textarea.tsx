import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import styles from "./textarea.module.css";

const textareaVariants = cva(styles.textarea, {
  variants: {
    variant: {
      default: styles.variantDefault,
      minimal: styles.variantMinimal,
      filled: styles.variantFilled,
    },
    tone: {
      sage: styles.toneSage,
      neutral: styles.toneNeutral,
      warm: styles.toneWarm,
    },
    state: {
      default: "",
      error: styles.stateError,
      success: styles.stateSuccess,
      warning: styles.stateWarning,
    },
    density: {
      compact: styles.densityCompact,
      default: styles.densityDefault,
      spacious: styles.densitySpacious,
    },
    radius: {
      none: styles.radiusNone,
      sm: styles.radiusSm,
      md: styles.radiusMd,
      lg: styles.radiusLg,
    },
  },
  defaultVariants: {
    variant: "default",
    density: "default",
    radius: "sm",
    state: "default",
  },
});

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {
  customStyle?: React.CSSProperties;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      tone,
      state,
      density,
      radius,
      customStyle,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <textarea
        ref={ref}
        style={{ ...customStyle, ...style }}
        className={cn(
          textareaVariants({ variant, tone, state, density, radius }),
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
