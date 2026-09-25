import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

describe("Card component (Minimal Warm Greige & Sage)", () => {
  it("renders card and its subcomponents properly", () => {
    render(
      <Card data-testid="card-root">
        <CardHeader>
          <CardTitle>Título do Cartão</CardTitle>
          <CardDescription>Descrição do Cartão</CardDescription>
        </CardHeader>
        <CardContent>Conteúdo do cartão aqui.</CardContent>
        <CardFooter>Rodapé do cartão.</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId("card-root")).toBeInTheDocument();
    expect(screen.getByText("Título do Cartão")).toBeInTheDocument();
    expect(screen.getByText("Descrição do Cartão")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do cartão aqui.")).toBeInTheDocument();
    expect(screen.getByText("Rodapé do cartão.")).toBeInTheDocument();
  });

  it("supports variants, tones, and interactive states", () => {
    const { rerender } = render(
      <Card variant="elevated" tone="sage" interactive data-testid="card">
        Conteúdo
      </Card>,
    );
    expect(screen.getByTestId("card")).toBeInTheDocument();

    rerender(
      <Card variant="minimal" tone="warm" radius="lg" data-testid="card">
        Minimal
      </Card>,
    );
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("applies density props on header, content, and footer", () => {
    render(
      <Card>
        <CardHeader density="compact" data-testid="card-header">
          <CardTitle size="sm">Mini Header</CardTitle>
        </CardHeader>
        <CardContent density="compact" data-testid="card-content">
          Mini Content
        </CardContent>
        <CardFooter density="compact" data-testid="card-footer">
          Mini Footer
        </CardFooter>
      </Card>,
    );

    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
    expect(screen.getByTestId("card-footer")).toBeInTheDocument();
  });
});
