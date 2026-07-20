"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Interaction, InteractionType, Lead, LeadStage } from "@/lib/crm/types";

/** Lista os leads ativos do funil (sem os arquivados), mais recentes primeiro. */
export async function listarLeads() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("crm_leads").select("*").eq("archived", false).order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as Lead[] };
  return { data: (data ?? []) as Lead[] };
}

/** Lista os leads arquivados (negócios "Ganho" já faturados) — histórico separado do quadro ativo. */
export async function listarLeadsArquivados() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("crm_leads").select("*").eq("archived", true).order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as Lead[] };
  return { data: (data ?? []) as Lead[] };
}

/** Arquiva o lead (ex: negócio "Ganho" já faturado) — some do quadro ativo sem excluir o histórico. */
export async function arquivarLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("crm_leads").update({ archived: true }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/crm");
  return { success: true };
}

/** Desarquiva o lead, devolvendo pro quadro ativo. */
export async function desarquivarLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("crm_leads").update({ archived: false }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/crm");
  return { success: true };
}

export interface NovoLeadInput {
  clienteId: string | null;
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  expectedValue: number | null;
  notes: string;
}

/** Cria uma nova oportunidade no funil, no estágio "novo". */
export async function criarLead(input: NovoLeadInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crm_leads")
    .insert({
      cliente_id: input.clienteId,
      company_name: input.companyName.trim(),
      contact_name: input.contactName.trim() || null,
      contact_phone: input.contactPhone.trim() || null,
      contact_email: input.contactEmail.trim() || null,
      expected_value: input.expectedValue,
      notes: input.notes.trim() || null,
      stage: "novo",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/crm");
  return { data: data as Lead };
}

/** Move o lead pra outro estágio do funil (drag-and-drop do kanban). */
export async function atualizarEstagioLead(id: string, stage: LeadStage) {
  const supabase = await createClient();
  const { error } = await supabase.from("crm_leads").update({ stage, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/crm");
  return { success: true };
}

export interface EditarContatoLeadInput {
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  expectedValue: number | null;
  notes: string;
}

/** Atualiza os dados de contato/valor/notas do lead — editado na drawer de detalhe. */
export async function atualizarContatoLead(id: string, input: EditarContatoLeadInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("crm_leads")
    .update({
      company_name: input.companyName.trim(),
      contact_name: input.contactName.trim() || null,
      contact_phone: input.contactPhone.trim() || null,
      contact_email: input.contactEmail.trim() || null,
      expected_value: input.expectedValue,
      notes: input.notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/crm");
  return { success: true };
}

/** Exclui o lead (e o histórico de interações junto, via cascade). */
export async function excluirLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("crm_leads").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/crm");
  return { success: true };
}

/** Lista o histórico de interações (ligações, e-mails, notas...) de um lead. */
export async function listarInteracoes(leadId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crm_interactions")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as Interaction[] };
  return { data: (data ?? []) as Interaction[] };
}

/** Registra uma interação no histórico do lead. */
export async function criarInteracao(leadId: string, tipo: InteractionType, conteudo: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crm_interactions")
    .insert({ lead_id: leadId, interaction_type: tipo, content: conteudo.trim() })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/crm");
  return { data: data as Interaction };
}
