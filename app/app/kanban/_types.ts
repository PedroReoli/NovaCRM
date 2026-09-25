export interface FunilDaLista {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  is_default: boolean;
  is_client_pipeline?: boolean;
}
