"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";
import styles from "./tabs.module.css";

const Tabs = TabsPrimitive.Root;

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: "default" | "line";
  customStyle?: React.CSSProperties;
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "default", customStyle, style, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    style={{ ...customStyle, ...style }}
    className={cn(
      styles.list,
      variant === "line" && styles.variantLine,
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  customStyle?: React.CSSProperties;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, customStyle, style, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    style={{ ...customStyle, ...style }}
    className={cn(styles.trigger, className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  customStyle?: React.CSSProperties;
}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, customStyle, style, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    style={{ ...customStyle, ...style }}
    className={cn(styles.content, className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
