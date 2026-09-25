import type { CampaignConfig, Prospect } from "@/lib/prospecting/schema";

export type Campaign = {
  id: string;
  name: string;
  status: string;
  search_status: string;
  error: string | null;
  config: CampaignConfig | null;
  result_count: number;
  skipped_count: number;
  cost_usd: string | null;
  next_send_at: string;
};

export type Candidate = {
  id: string;
  campaign_id: string;
  data: Prospect;
  progress: string;
  message_status: string | null;
  error: string | null;
  conversation_id: string | null;
};

export type State = {
  configured: boolean;
  campaigns: Campaign[];
  candidates: Candidate[];
  agents: { id: string; name: string }[];
  channels: {
    id: string;
    display_name: string | null;
    phone_number: string | null;
    status: string;
  }[];
  stages: { id: string; name: string; pipeline_id: string; pipeline_name: string }[];
};

export const labels: Record<string, string> = {
  draft: "Preparar campanha",
  running: "Em andamento",
  paused: "Pausada",
  completed: "Abordagens concluídas",
  starting: "Iniciando busca",
  succeeded: "Busca concluída",
  failed: "Revisar falha",
  unknown: "Busca sem confirmação",
  new: "Encontrado",
  queued: "Na fila",
  sending: "Preparando abordagem",
  sent: "Abordado",
  skipped: "Não abordado",
  replied: "Respondeu",
  qualified: "Qualificado",
};

export const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export const emptyConfig: CampaignConfig = {
  agent_id: "",
  channel_session_id: "",
  pipeline_id: "",
  stage_id: "",
  qualified_stage_id: "",
  instruction: "",
  qualification: "",
  daily_limit: 10,
  interval_minutes: 15,
  legal_basis_ref: "",
};
