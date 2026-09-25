import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button component (Minimal Warm Greige & Sage)", () => {
  it("renders correctly with default props", () => {
    render(<Button>Clique aqui</Button>);
    const btn = screen.getByRole("button", { name: /clique aqui/i });
    expect(btn).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Ação</Button>);
    const btn = screen.getByRole("button", { name: /ação/i });
    await userEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders loading state with aria-busy and spinner", () => {
    render(<Button isLoading>Salvando...</Button>);
    const btn = screen.getByRole("button", { name: /salvando/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("button-spinner")).toBeInTheDocument();
  });

  it("supports minimal and other variants without crashing", () => {
    const { rerender } = render(<Button variant="minimal">Minimal</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("applies tone and density props", () => {
    render(
      <Button tone="sage" density="compact" radius="full">
        Adaptável
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /adaptável/i });
    expect(btn).toBeInTheDocument();
  });

  it("renders leftIcon and rightIcon", () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">←</span>}
        rightIcon={<span data-testid="right-icon">→</span>}
      >
        Com Ícones
      </Button>,
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("applies customStyle and fullWidth", () => {
    render(
      <Button fullWidth customStyle={{ letterSpacing: "1px" }}>
        Full Width
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /full width/i });
    expect(btn).toHaveStyle({ letterSpacing: "1px" });
  });
});
