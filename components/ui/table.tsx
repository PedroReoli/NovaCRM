import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./table.module.css";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  density?: "compact" | "default" | "spacious";
  striped?: boolean;
  customStyle?: React.CSSProperties;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      density = "default",
      striped = false,
      customStyle,
      style,
      ...props
    },
    ref,
  ) => (
    <div className={styles.wrapper}>
      <table
        ref={ref}
        style={{ ...customStyle, ...style }}
        className={cn(
          styles.table,
          density === "compact" && styles.densityCompact,
          density === "spacious" && styles.densitySpacious,
          striped && styles.striped,
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  customStyle?: React.CSSProperties;
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, customStyle, style, ...props }, ref) => (
    <thead
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={className}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  customStyle?: React.CSSProperties;
}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, customStyle, style, ...props }, ref) => (
    <tbody
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={className}
      {...props}
    />
  ),
);
TableBody.displayName = "TableBody";

export interface TableFooterProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  customStyle?: React.CSSProperties;
}

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, customStyle, style, ...props }, ref) => (
    <tfoot
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={cn(styles.footer, className)}
      {...props}
    />
  ),
);
TableFooter.displayName = "TableFooter";

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  customStyle?: React.CSSProperties;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, customStyle, style, ...props }, ref) => (
    <tr
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={cn(styles.row, className)}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  customStyle?: React.CSSProperties;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, customStyle, style, ...props }, ref) => (
    <th
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={cn(styles.th, className)}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  customStyle?: React.CSSProperties;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, customStyle, style, ...props }, ref) => (
    <td
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={cn(styles.cell, className)}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

export interface TableCaptionProps
  extends React.HTMLAttributes<HTMLTableCaptionElement> {
  customStyle?: React.CSSProperties;
}

const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, customStyle, style, ...props }, ref) => (
    <caption
      ref={ref}
      style={{ ...customStyle, ...style }}
      className={cn(styles.caption, className)}
      {...props}
    />
  ),
);
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
