import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

vi.mock("@/hooks/i18n/useT", () => ({ useT: () => (chave: string) => chave }));

describe("Sheet component (Minimal Warm Greige & Sage)", () => {
  it("opens drawer sheet and displays title and content", async () => {
    render(
      <Sheet>
        <SheetTrigger>Abrir Gaveta</SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu Lateral</SheetTitle>
            <SheetDescription>Navegação móvel</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.queryByText("Menu Lateral")).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: /abrir gaveta/i });
    await userEvent.click(trigger);

    expect(screen.getByText("Menu Lateral")).toBeInTheDocument();
    expect(screen.getByText("Navegação móvel")).toBeInTheDocument();
  });
});
