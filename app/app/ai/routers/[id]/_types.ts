import type { RouterMemberInput } from "@/hooks/ai/useRouters";

export interface AgentLite {
  id: string;
  name: string;
}

export interface DraftMember extends RouterMemberInput {
  key: string;
}
