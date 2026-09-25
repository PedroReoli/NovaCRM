import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

describe("Primitives (Skeleton, Avatar, Separator) — Minimal Warm Greige & Sage", () => {
  it("renders Skeleton with radius prop", () => {
    render(<Skeleton data-testid="skeleton" radius="full" />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("renders Avatar with fallback and custom size", () => {
    render(
      <Avatar size="lg" data-testid="avatar-root">
        <AvatarFallback>PL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("avatar-root")).toBeInTheDocument();
    expect(screen.getByText("PL")).toBeInTheDocument();
  });

  it("renders Separator with horizontal and vertical orientation", () => {
    const { rerender } = render(
      <Separator orientation="horizontal" tone="sage" data-testid="separator" />,
    );
    expect(screen.getByTestId("separator")).toBeInTheDocument();

    rerender(<Separator orientation="vertical" tone="subtle" data-testid="separator" />);
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });
});
