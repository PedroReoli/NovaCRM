export type Item = {
  id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  discount_cents: number;
  total_cents: number;
  commission_percent: number;
  attendant_user_id: string | null;
  event_type_id: string | null;
};

export type Comanda = {
  id: string;
  number: number;
  status: "open" | "finalized" | "cancelled";
  contact_id: string | null;
  discount_cents: number;
  total_cents: number;
  currency: string;
  notes: string | null;
  finalized_at: string | null;
  reversed_at: string | null;
  sale_items?: Item[];
};

export type Forma = { id: string; name: string; account_id: string | null };
export type Tipo = { id: string; name: string; default_price_cents: number | null };
