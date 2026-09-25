import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Switch } from "@/components/ui/switch";

describe("Switch component (Minimal Warm Greige & Sage)", () => {
  it("renders unchecked by default and toggles on click", async () => {
    render(<Switch aria-label="Notificações" />);
    const switchEl = screen.getByRole("switch", { name: /notificações/i });
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute("data-state", "unchecked");

    await userEvent.click(switchEl);
    expect(switchEl).toHaveAttribute("data-state", "checked");
  });

  it("supports tone, size and customStyle props", () => {
    render(
      <Switch
        tone="warm"
        size="sm"
        aria-label="Ativo"
        customStyle={{ opacity: 0.95 }}
      />,
    );
    const switchEl = screen.getByRole("switch", { name: /ativo/i });
    expect(switchEl).toHaveStyle({ opacity: 0.95 });
  });
});
