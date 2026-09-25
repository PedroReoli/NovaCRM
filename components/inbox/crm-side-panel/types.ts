import type { Locale } from "date-fns";
import { format } from "date-fns";
import type { CustomFieldDef } from "@/components/contacts/CustomFieldsEditor";

export interface LeadRow {
  id: string;
  title: string;
  status: string;
  value_cents: number | null;
  currency: string | null;
  updated_at: string;
  pipeline_id: string;
  custom_fields: Record<string, unknown> | null;
  field_defs: CustomFieldDef[];
  funil_nome: string | null;
  etapa_nome: string | null;
}

export interface OrderRow {
  id: string;
  external_id: string | null;
  status: string | null;
  total_cents: number | null;
  currency: string | null;
  created_at: string;
}

export interface ActivityRow {
  id: string;
  type: string;
  source_module: string;
  performed_at: string;
  payload: Record<string, unknown> | null;
  reason: string | null;
  actor_kind: string | null;
  performed_by_name?: string | null;
}

export interface DemandaRow {
  id: string;
  revision: number;
  aberta_em: string;
  origem: string;
  estado: string;
  proximo_passo: string | null;
  proximo_passo_em: string | null;
  prazo_em: string | null;
}

export interface DesfechoDraft {
  conversationId: string;
  contactId: string;
  demandaId: string;
  revision: number;
  desfecho: string;
  salvando: boolean;
}

export const DESFECHO_LEGIVEL: Record<string, string> = {
  resolvida: "Resolvida",
  convertida: "Convertida",
  nao_procede: "Não procede",
  encerrada_pelo_cliente: "Encerrada pelo cliente",
  perdida: "Perdida",
  expirada_sem_resposta: "Expirada sem resposta",
};

export const ESTADO_LEGIVEL: Record<string, string> = {
  aberta: "Aberta",
  em_atendimento: "Em atendimento",
  aguardando_cliente: "Aguardando o cliente",
};

export const STATUS_DO_LEAD: Record<string, string> = {
  open: "Aberto",
  won: "Ganho",
  lost: "Perdido",
};

export function horasDesde(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000));
}

export function formatMoney(cents: number | null, currency: string | null): string {
  if (cents == null) return "—";
  const cur = currency ?? "BRL";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: cur }).format(
      cents / 100,
    );
  } catch {
    return `${(cents / 100).toFixed(2)} ${cur}`;
  }
}

export function shortDate(iso: string, locale: Locale): string {
  return format(new Date(iso), "dd/MM/yy HH:mm", { locale: locale });
}

export function ondeEstaOLead(l: LeadRow): string {
  return [l.funil_nome, l.etapa_nome].filter(Boolean).join(" · ");
}

export const CLASSES_DE_ONDE_ESTA = "line-clamp-2 text-muted-foreground";
