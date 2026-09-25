import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Textarea } from "@/components/ui/textarea";

describe("Textarea component (Minimal Warm Greige & Sage)", () => {
  it("renders with placeholder and accepts input", async () => {
    render(<Textarea placeholder="Descreva o lead..." />);
    const textarea = screen.getByPlaceholderText("Descreva o lead...");
    expect(textarea).toBeInTheDocument();

    await userEvent.type(textarea, "Lead interessado em automação WAHA");
    expect(textarea).toHaveValue("Lead interessado em automação WAHA");
  });

  it("supports variants, states and customStyle", () => {
    const { rerender } = render(
      <Textarea
        variant="minimal"
        state="error"
        aria-invalid="true"
        placeholder="Com erro"
      />,
    );
    const textarea = screen.getByPlaceholderText("Com erro");
    expect(textarea).toHaveAttribute("aria-invalid", "true");

    rerender(
      <Textarea
        variant="filled"
        density="compact"
        placeholder="Compact"
        customStyle={{ letterSpacing: "1px" }}
      />,
    );
    expect(screen.getByPlaceholderText("Compact")).toHaveStyle({ letterSpacing: "1px" });
  });
});
