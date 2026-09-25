import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui/input";

describe("Input component (Minimal Warm Greige & Sage)", () => {
  it("renders with default props and accepts text", async () => {
    render(<Input placeholder="Digite seu e-mail" />);
    const input = screen.getByPlaceholderText("Digite seu e-mail");
    expect(input).toBeInTheDocument();

    await userEvent.type(input, "pedro@reoli.com");
    expect(input).toHaveValue("pedro@reoli.com");
  });

  it("renders left and right elements", () => {
    render(
      <Input
        placeholder="Com adornos"
        leftElement={<span data-testid="search-icon">🔍</span>}
        rightElement={<button type="button">Limpar</button>}
      />,
    );
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /limpar/i })).toBeInTheDocument();
  });

  it("supports variants, states and customStyle", () => {
    const { rerender } = render(
      <Input
        variant="minimal"
        state="error"
        aria-invalid="true"
        placeholder="Com erro"
      />,
    );
    const input = screen.getByPlaceholderText("Com erro");
    expect(input).toHaveAttribute("aria-invalid", "true");

    rerender(
      <Input
        variant="flush"
        state="success"
        placeholder="Flush"
        customStyle={{ fontWeight: 600 }}
      />,
    );
    const flushInput = screen.getByPlaceholderText("Flush");
    expect(flushInput).toHaveStyle({ fontWeight: 600 });
  });
});
