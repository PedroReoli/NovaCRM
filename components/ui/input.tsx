import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import styles from "./input.module.css";

const inputVariants = cva(styles.input, {
  variants: {
    variant: {
      default: styles.variantDefault,
      minimal: styles.variantMinimal,
      filled: styles.variantFilled,
      flush: styles.variantFlush,
    },
    tone: {
      sage: styles.toneSage,
      neutral: styles.toneNeutral,
      warm: styles.toneWarm,
    },
    inputSize: {
      sm: styles.sizeSm,
      default: styles.sizeDefault,
      lg: styles.sizeLg,
    },
    state: {
      default: "",
      error: styles.stateError,
      success: styles.stateSuccess,
      warning: styles.stateWarning,
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
    variant: "default",
    inputSize: "default",
    radius: "sm",
    state: "default",
  },
});

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  customStyle?: React.CSSProperties;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      tone,
      inputSize,
      state,
      radius,
      leftElement,
      rightElement,
      customStyle,
      style,
      ...props
    },
    ref,
  ) => {
    const inputElement = (
      <input
        type={type}
        ref={ref}
        style={{ ...customStyle, ...style }}
        className={cn(
          inputVariants({ variant, tone, inputSize, state, radius }),
          leftElement && styles.hasLeftAdornment,
          rightElement && styles.hasRightAdornment,
          className,
        )}
        {...props}
      />
    );

    if (!leftElement && !rightElement) {
      return inputElement;
    }

    return (
      <div className={styles.wrapper}>
        {leftElement && <div className={styles.leftAdornment}>{leftElement}</div>}
        {inputElement}
        {rightElement && <div className={styles.rightAdornment}>{rightElement}</div>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
