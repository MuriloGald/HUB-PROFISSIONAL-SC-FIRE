/** Tipos de domínio do SC Fire CRM (teste). */

export type AppRole = "admin" | "user";

/** Status de acesso do usuário — novos usuários começam bloqueados (paywall). */
export type ProfileStatus = "pending" | "approved" | "blocked";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  status: ProfileStatus;
  onboarding_done: boolean;
  created_at: string;
}

export interface SessionUser {
  id: string;
  email: string;
}

export interface SdrConfig {
  id: string;
  user_id: string;
  agent_name: string;
  company_context: string;
  products: string;
  qualification_criteria: string;
  communication_style: string;
  handoff_rules: string;
  enabled: boolean;
}

export type WhatsappStatus = "disconnected" | "connecting" | "connected";

export interface WhatsappInstance {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  status: WhatsappStatus;
  created_at: string;
}

export type CrmStage = "conversas" | "negociando" | "ganho" | "perda";

export const CRM_STAGES: { key: CrmStage; label: string }[] = [
  { key: "conversas", label: "Conversas" },
  { key: "negociando", label: "Negociando" },
  { key: "ganho", label: "Ganho" },
  { key: "perda", label: "Perda" },
];

export interface CrmCard {
  id: string;
  user_id: string;
  lead_name: string;
  phone: string;
  stage: CrmStage;
  last_message: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  from: "lead" | "agent";
  text: string;
  at: string;
}

export interface Chat {
  id: string;
  lead_name: string;
  phone: string;
  last_message: string;
  unread: number;
  messages: ChatMessage[];
}
