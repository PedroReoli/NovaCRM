import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

vi.mock("@/hooks/i18n/useT", () => ({ useT: () => (chave: string) => chave }));

describe("Dialog component (Minimal Warm Greige & Sage)", () => {
  it("opens modal and displays header, title, and description", async () => {
    render(
      <Dialog>
        <DialogTrigger>Abrir Modal</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título do Modal</DialogTitle>
            <DialogDescription>Descrição detalhada do modal.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.queryByText("Título do Modal")).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: /abrir modal/i });
    await userEvent.click(trigger);

    expect(screen.getByText("Título do Modal")).toBeInTheDocument();
    expect(screen.getByText("Descrição detalhada do modal.")).toBeInTheDocument();
  });
});
