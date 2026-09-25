import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import styles from "./card.module.css";

const cardVariants = cva(styles.card, {
  variants: {
    variant: {
      default: styles.variantDefault,
      elevated: styles.variantElevated,
      flat: styles.variantFlat,
      minimal: styles.variantMinimal,
      bordered: styles.variantBordered,
    },
    tone: {
      sage: styles.toneSage,
      neutral: styles.toneNeutral,
      warm: styles.toneWarm,
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
    radius: "md",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  interactive?: boolean;
  density?: "compact" | "default" | "spacious";
  customStyle?: React.CSSProperties;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      tone,
      radius,
      interactive = false,
      customStyle,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        style={{ ...customStyle, ...style }}
        className={cn(
          cardVariants({ variant, tone, radius }),
          interactive && styles.interactive,
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: "compact" | "default" | "spacious";
  customStyle?: React.CSSProperties;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, density = "default", customStyle, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={cn(
        styles.header,
        density === "compact" && styles.headerCompact,
        density === "spacious" && styles.headerSpacious,
        className,
      )}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: "sm" | "md" | "lg";
  customStyle?: React.CSSProperties;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size = "md", customStyle, style, ...props }, ref) => (
    <h3
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={cn(
        styles.title,
        size === "sm" && "text-sm",
        size === "lg" && "text-lg",
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  customStyle?: React.CSSProperties;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, customStyle, style, ...props }, ref) => (
    <p
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={cn(styles.description, className)}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: "compact" | "default" | "spacious";
  customStyle?: React.CSSProperties;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, density = "default", customStyle, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={cn(
        styles.content,
        density === "compact" && styles.contentCompact,
        density === "spacious" && styles.contentSpacious,
        className,
      )}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: "compact" | "default" | "spacious";
  customStyle?: React.CSSProperties;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, density = "default", customStyle, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={cn(
        styles.footer,
        density === "compact" && styles.footerCompact,
        density === "spacious" && styles.footerSpacious,
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
