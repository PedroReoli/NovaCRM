import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

describe("DropdownMenu component", () => {
  it("renders menu content and items with accentTheme sage", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent accentTheme="sage" data-testid="menu-content">
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem data-testid="menu-item-1">Edit</DropdownMenuItem>
          <DropdownMenuItem data-testid="menu-item-2">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByTestId("menu-content")).toBeInTheDocument();
    expect(screen.getByText("Options")).toBeInTheDocument();
    expect(screen.getByTestId("menu-item-1")).toHaveTextContent("Edit");
    expect(screen.getByTestId("menu-item-2")).toHaveTextContent("Delete");
  });
});
