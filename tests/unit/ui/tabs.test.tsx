import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

describe("Tabs component (Minimal Warm Greige & Sage)", () => {
  it("renders tabs and switches active tab on click", async () => {
    render(
      <Tabs defaultValue="aba1">
        <TabsList>
          <TabsTrigger value="aba1">Visão Geral</TabsTrigger>
          <TabsTrigger value="aba2">Detalhes</TabsTrigger>
        </TabsList>
        <TabsContent value="aba1">Conteúdo Geral</TabsContent>
        <TabsContent value="aba2">Conteúdo Detalhado</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Conteúdo Geral")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo Detalhado")).not.toBeInTheDocument();

    const trigger2 = screen.getByRole("tab", { name: /detalhes/i });
    await userEvent.click(trigger2);

    expect(screen.getByText("Conteúdo Detalhado")).toBeInTheDocument();
  });

  it("supports line variant on TabsList", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList variant="line" data-testid="tabs-list">
          <TabsTrigger value="a">Aba A</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByTestId("tabs-list")).toBeInTheDocument();
  });
});
