import type { AcaoDeCampanha } from "@/hooks/campanhas/useCampanhas";
import { TEXTO_DA_EXCLUSAO } from "@/lib/campanhas/tipos";

export const ROTULO_DA_ACAO: Record<AcaoDeCampanha, string> = {
  preparar: "Preparar lista",
  iniciar: "Iniciar envio",
  agendar: "Agendar",
  pausar: "Pausar",
  retomar: "Retomar",
  cancelar: "Cancelar campanha",
  duplicar: "Duplicar",
  testar: "Enviar teste",
};

export const ROTULO_DO_DESTINATARIO: Record<string, string> = {
  pending: "Na fila",
  queued: "Na fila",
  sending: "Enviando",
  sent: "Enviada",
  delivered: "Entregue",
  read: "Lida",
  replied: "Respondeu",
  failed: "Falhou",
  skipped: "Fora da lista",
  cancelled: "Cancelada",
  opted_out: "Pediu para parar",
};

export function rotuloDoMotivo(motivo: string | null): string {
  if (!motivo) return "Fora da lista";
  return (TEXTO_DA_EXCLUSAO as Record<string, string>)[motivo] ?? motivo;
}
