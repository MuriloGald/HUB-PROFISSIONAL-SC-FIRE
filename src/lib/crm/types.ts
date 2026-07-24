export type LeadStage = "novo" | "contatado" | "proposta_enviada" | "negociacao" | "ganho" | "perdido";

export const ESTAGIOS: { key: LeadStage; label: string; color: string }[] = [
  { key: "novo", label: "Novo", color: "border-gray-500/40 bg-gray-500/5" },
  { key: "contatado", label: "Contatado", color: "border-blue-500/40 bg-blue-500/5" },
  { key: "proposta_enviada", label: "Proposta Enviada", color: "border-amber-500/40 bg-amber-500/5" },
  { key: "negociacao", label: "Negociação", color: "border-orange-500/40 bg-orange-500/5" },
  { key: "ganho", label: "Ganho", color: "border-emerald-500/40 bg-emerald-500/5" },
  { key: "perdido", label: "Perdido", color: "border-red-500/40 bg-red-500/5" },
];

export interface Lead {
  id: string;
  cliente_id: string | null;
  company_name: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  stage: LeadStage;
  expected_value: number | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
}

export type InteractionType = "ligacao" | "email" | "reuniao" | "nota" | "proposta";

export interface Interaction {
  id: string;
  lead_id: string;
  interaction_type: InteractionType;
  content: string;
  created_at: string;
}

export interface SdrConfig {
  id: string;
  agent_name: string;
  company_context: string;
  products: string;
  qualification_criteria: string;
  communication_style: string;
  handoff_rules: string;
  enabled: boolean;
  updated_at: string;
}

export type WhatsappInstanceStatus = "disconnected" | "connected";

export interface WhatsappInstance {
  id: string;
  name: string;
  phone: string | null;
  status: WhatsappInstanceStatus;
  created_at: string;
}
