import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TopBar } from "@/components/shell/TopBar";

// Mock child components that rely on full application context
vi.mock("@/components/shell/MobileSidebar", () => ({
  MobileSidebar: () => <div data-testid="mobile-sidebar" />,
}));
vi.mock("@/components/shell/TenantSwitcher", () => ({
  TenantSwitcher: () => <div data-testid="tenant-switcher" />,
}));
vi.mock("@/components/shell/SearchTrigger", () => ({
  SearchTrigger: () => <div data-testid="search-trigger" />,
}));
vi.mock("@/components/shell/AlertsBell", () => ({
  AlertsBell: () => <div data-testid="alerts-bell" />,
}));
vi.mock("@/components/shell/UserMenu", () => ({
  UserMenu: () => <div data-testid="user-menu" />,
}));

describe("TopBar layout (Minimal Warm Greige & Sage)", () => {
  it("renders default layout with all subcomponents", () => {
    render(<TopBar data-testid="topbar" />);
    expect(screen.getByTestId("topbar")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("tenant-switcher")).toBeInTheDocument();
    expect(screen.getByTestId("search-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("alerts-bell")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
  });

  it("supports minimal and translucent variants with custom styles", () => {
    const { rerender } = render(
      <TopBar
        variant="minimal"
        tone="warm"
        borderStyle="none"
        density="compact"
        customStyle={{ opacity: 0.9 }}
        data-testid="topbar"
      />,
    );
    const topbar = screen.getByTestId("topbar");
    expect(topbar).toHaveStyle({ opacity: 0.9 });

    rerender(
      <TopBar
        variant="translucent"
        density="spacious"
        borderStyle="subtle"
        data-testid="topbar"
      />,
    );
    expect(topbar).toBeInTheDocument();
  });

  it("supports children override for custom layouts", () => {
    render(
      <TopBar>
        <span data-testid="custom-child">Cabeçalho Personalizado</span>
      </TopBar>,
    );
    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    expect(screen.queryByTestId("search-trigger")).not.toBeInTheDocument();
  });
});
