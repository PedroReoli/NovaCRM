import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

describe("Tooltip component", () => {
  it("renders trigger and content with sage variant and size", () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent variant="sage" size="lg" data-testid="tooltip-content">
            Helpful tip
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByText("Hover me");
    expect(trigger).toBeInTheDocument();

    const content = screen.getByTestId("tooltip-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Helpful tip");
  });
});
