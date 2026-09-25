import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";

describe("Badge component (Minimal Warm Greige & Sage)", () => {
  it("renders with default props", () => {
    render(<Badge>Ativo</Badge>);
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("renders with dot indicator", () => {
    const { container } = render(<Badge dot>Online</Badge>);
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(container.querySelector("span[aria-hidden='true']")).toBeInTheDocument();
  });

  it("supports minimal and status variants", () => {
    const { rerender } = render(<Badge variant="minimal">Minimal</Badge>);
    expect(screen.getByText("Minimal")).toBeInTheDocument();

    rerender(<Badge variant="success">Sucesso</Badge>);
    expect(screen.getByText("Sucesso")).toBeInTheDocument();

    rerender(<Badge variant="warning">Pendente</Badge>);
    expect(screen.getByText("Pendente")).toBeInTheDocument();

    rerender(<Badge variant="error">Erro</Badge>);
    expect(screen.getByText("Erro")).toBeInTheDocument();
  });

  it("supports tones, sizes and customStyle", () => {
    render(
      <Badge
        tone="sage"
        size="sm"
        radius="md"
        customStyle={{ textTransform: "uppercase" }}
      >
        Novo
      </Badge>,
    );
    const badge = screen.getByText("Novo");
    expect(badge).toHaveStyle({ textTransform: "uppercase" });
  });
});
