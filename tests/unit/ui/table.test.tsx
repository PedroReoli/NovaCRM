import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

describe("Table component (Minimal Warm Greige & Sage)", () => {
  it("renders table, header, rows and cells properly", () => {
    render(
      <Table data-testid="table-root" density="compact" striped>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow data-testid="table-row">
            <TableCell>Pedro Lucas</TableCell>
            <TableCell>Ativo</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByTestId("table-root")).toBeInTheDocument();
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Pedro Lucas")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });
});
