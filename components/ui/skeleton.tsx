import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./skeleton.module.css";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: "none" | "sm" | "md" | "lg" | "full";
  customStyle?: React.CSSProperties;
}

function Skeleton({
  className,
  radius = "md",
  customStyle,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      style={{ ...customStyle, ...style }}
      className={cn(
        styles.skeleton,
        radius === "none" && styles.radiusNone,
        radius === "sm" && styles.radiusSm,
        radius === "md" && styles.radiusMd,
        radius === "lg" && styles.radiusLg,
        radius === "full" && styles.radiusFull,
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
