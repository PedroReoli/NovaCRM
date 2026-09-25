import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

describe("Select component (Minimal Warm Greige & Sage)", () => {
  it("renders trigger with placeholder", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Opções">
          <SelectValue placeholder="Selecione um status" />
        </SelectTrigger>
      </Select>,
    );

    const trigger = screen.getByRole("combobox", { name: /opções/i });
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText("Selecione um status")).toBeInTheDocument();
  });

  it("supports minimal and filled variants on trigger", () => {
    const { rerender } = render(
      <Select>
        <SelectTrigger variant="minimal" aria-label="Opções">
          <SelectValue placeholder="Minimal" />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();

    rerender(
      <Select>
        <SelectTrigger variant="filled" density="compact" aria-label="Opções">
          <SelectValue placeholder="Filled" />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
