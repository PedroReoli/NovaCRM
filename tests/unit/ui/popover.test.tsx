import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

describe("Popover component", () => {
  it("renders trigger and content with custom variant and elevation", () => {
    render(
      <Popover open>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent variant="sage" elevation="floating" data-testid="popover-content">
          <div>Popover Body</div>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByText("Open Popover");
    expect(trigger).toBeInTheDocument();

    const content = screen.getByTestId("popover-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Popover Body");
  });
});
