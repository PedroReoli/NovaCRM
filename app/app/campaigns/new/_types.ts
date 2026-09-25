export interface FiltroAudiencia {
  com_alguma_tag: string[];
  sem_tags: string[];
  sem_interacao_ha_dias: number | null;
  funis: string[];
  etapas: string[];
  limite: number;
}

export function listar(bruto: string): string[] {
  return bruto
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
