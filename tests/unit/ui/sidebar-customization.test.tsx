import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { Sidebar } from "@/components/shell/Sidebar";
import { MarcaDaInstalacaoProvider } from "@/lib/branding/contexto";
import type { Branding } from "@/lib/branding";

vi.mock("next/navigation", () => ({ usePathname: () => "/app/inbox" }));
vi.mock("@/app/actions/shell/toggleSidebar", () => ({ toggleSidebar: vi.fn() }));
vi.mock("@/hooks/i18n/useT", () => ({ useT: () => (chave: string) => chave }));
vi.mock("@/components/connections/ConnectionHealthDot", () => ({
  ConnectionHealthDot: () => null,
}));
vi.mock("@/components/shell/VersionFooter", () => ({ VersionFooter: () => null }));
vi.mock("@/hooks/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: { is_platform_admin: false, support: false },
    activeOrg: { role: "admin", interface_settings: {}, modulos_ligados: [] },
  }),
}));

const mockBranding: Branding = {
  name: "NovaCRM Minimal",
  logoUrl: null,
  initial: "N",
};

describe("Sidebar Layout Customization (Minimal Warm Greige & Sage)", () => {
  it("renders expanded sidebar with custom tone and styles", () => {
    render(
      <MarcaDaInstalacaoProvider marca={mockBranding}>
        <Sidebar
          collapsed={false}
          tone="warm"
          borderStyle="subtle"
          customStyle={{ zIndex: 40 }}
          data-testid="sidebar-root"
        />
      </MarcaDaInstalacaoProvider>,
    );

    const sidebar = screen.getByTestId("sidebar-root");
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveStyle({ zIndex: 40 });
    expect(screen.getByText("NovaCRM Minimal")).toBeInTheDocument();
  });

  it("renders collapsed sidebar correctly", () => {
    render(
      <MarcaDaInstalacaoProvider marca={mockBranding}>
        <Sidebar
          collapsed={true}
          tone="minimal"
          borderStyle="none"
          data-testid="sidebar-collapsed"
        />
      </MarcaDaInstalacaoProvider>,
    );

    const sidebar = screen.getByTestId("sidebar-collapsed");
    expect(sidebar).toBeInTheDocument();
  });
});
