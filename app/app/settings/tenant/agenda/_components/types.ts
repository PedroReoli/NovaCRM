import { LOCAIS_DE_ATENDIMENTO } from "@/lib/agenda/locais";
import type { UnidadeDeAntecedencia } from "@/lib/agenda/lembretes";

export interface TipoRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  duration_minutes: number;
  location_kind: string;
  location_details: string | null;
  default_owner_user_id: string | null;
  requires_confirmation: boolean;
  is_active: boolean;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
  reminder_extra_offsets_minutes: number[] | null;
  reminder_body: string | null;
  reminder_bodies: Record<string, string> | null;
  default_price_cents: number | null;
}

export const CATEGORIAS: Array<{ valor: string; rotulo: string }> = [
  { valor: "consulta", rotulo: "Consulta" },
  { valor: "procedimento", rotulo: "Procedimento" },
  { valor: "retorno", rotulo: "Retorno" },
  { valor: "visita", rotulo: "Visita" },
  { valor: "vistoria", rotulo: "Vistoria" },
  { valor: "reuniao", rotulo: "Reunião" },
  { valor: "call", rotulo: "Call" },
  { valor: "orcamento", rotulo: "Orçamento" },
  { valor: "demonstracao", rotulo: "Demonstração" },
  { valor: "outro", rotulo: "Outro" },
];

export const LOCAIS = LOCAIS_DE_ATENDIMENTO;

export const rotuloDe = (
  lista: ReadonlyArray<{ valor: string; rotulo: string }>,
  valor: string,
) => lista.find((c) => c.valor === valor)?.rotulo ?? valor;

export interface Rascunho {
  name: string;
  category: string;
  duration_minutes: number;
  location_kind: string;
  default_owner_user_id: string;
}

export const VAZIO: Rascunho = {
  name: "",
  category: "consulta",
  duration_minutes: 30,
  location_kind: "in_person",
  default_owner_user_id: "",
};

export type CartaoDeLembrete = {
  id: string;
  quantidade: number;
  unidade: UnidadeDeAntecedencia;
  body: string;
};
