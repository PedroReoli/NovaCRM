import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "@/app/app/_components/AppShell";

vi.mock("@/components/shell/Sidebar", () => ({
  Sidebar: (props: { tone?: string; collapsed?: boolean }) => (
    <div data-testid="sidebar" data-tone={props.tone} />
  ),
}));
vi.mock("@/components/shell/TopBar", () => ({
  TopBar: (props: { variant?: string; tone?: string }) => (
    <div data-testid="topbar" data-variant={props.variant} data-tone={props.tone} />
  ),
}));
vi.mock("@/components/shell/BarraDeProgressoNavegacao", () => ({
  BarraDeProgressoNavegacao: () => <div data-testid="progress-bar" />,
}));
vi.mock("@/hooks/atendimento/useSinalDePresenca", () => ({
  useSinalDePresenca: vi.fn(),
}));
vi.mock("@/hooks/notifications/useInboundMessageAlerts", () => ({
  useInboundMessageAlerts: vi.fn(),
}));
vi.mock("@/hooks/calls/useInboundCallAlerts", () => ({
  useInboundCallAlerts: vi.fn(),
}));
vi.mock("@/hooks/notifications/useCrmAlerts", () => ({
  useCrmAlerts: vi.fn(),
}));
vi.mock("@/lib/notifications/notify_open", () => ({
  useNotifyOpenFromServiceWorker: vi.fn(),
}));
vi.mock("@/lib/ui/rodape-ocupado", () => ({
  useOcupacaoDoRodape: () => 0,
  estiloDaReserva: () => ({}),
}));

describe("AppShell Layout Customization (Minimal Warm Greige & Sage)", () => {
  it("renders with default layout and passes props to Sidebar and TopBar", () => {
    render(
      <AppShell
        sidebarCollapsed={false}
        podeAtender={true}
        sidebarTone="warm"
        topBarVariant="translucent"
        topBarTone="surface"
        contentPadding="spacious"
      >
        <div data-testid="page-content">Conteúdo da Página</div>
      </AppShell>,
    );

    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-tone", "warm");
    expect(screen.getByTestId("topbar")).toHaveAttribute("data-variant", "translucent");
    expect(screen.getByTestId("topbar")).toHaveAttribute("data-tone", "surface");
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });
});
