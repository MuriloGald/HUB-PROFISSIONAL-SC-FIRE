"use server";

import { createClient } from "@/lib/supabase/server";
import type { Laudo } from "@/lib/supabase/types";
import type { RecursoWizardState, RessarcimentoWizardState } from "@/lib/in02/types";

/** Salva (cria ou atualiza) o Formulário de Recurso, gerando um código REC-AAAA-NNN quando novo. */
export async function salvarRecurso(state: RecursoWizardState) {
  const supabase = await createClient();

  let codigo = state.codigo;

  if (!state.laudoId) {
    const ano = new Date().getFullYear();
    const { count } = await supabase
      .from("laudos")
      .select("*", { count: "exact", head: true })
      .eq("tipo_documento", "IN02")
      .contains("dados", { documento: "recurso" })
      .gte("created_at", `${ano}-01-01`)
      .lt("created_at", `${ano + 1}-01-01`);

    codigo = `REC-${ano}-${((count ?? 0) + 1).toString().padStart(3, "0")}`;
  }

  const dados: RecursoWizardState & { documento: "recurso" } = {
    ...state,
    documento: "recurso",
    codigo,
    data_emissao: state.data_emissao || new Date().toISOString(),
  };
  delete dados.laudoId;

  const payload = {
    cliente_id: state.cliente_id,
    tipo_documento: "IN02" as const,
    status: "concluido" as const,
    dados,
  };

  const query = state.laudoId
    ? supabase.from("laudos").update(payload).eq("id", state.laudoId).select().single()
    : supabase.from("laudos").insert(payload).select().single();

  const { data, error } = await query;

  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function listarRecursos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laudos")
    .select("*")
    .eq("tipo_documento", "IN02")
    .contains("dados", { documento: "recurso" })
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as Laudo[] };
  return { data: (data ?? []) as Laudo[] };
}

export async function buscarRecurso(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("id", id).single();

  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function excluirRecurso(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("laudos").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

/** Salva (cria ou atualiza) o Requerimento de Ressarcimento de Multa, gerando um código RES-AAAA-NNN quando novo. */
export async function salvarRessarcimento(state: RessarcimentoWizardState) {
  const supabase = await createClient();

  let codigo = state.codigo;

  if (!state.laudoId) {
    const ano = new Date().getFullYear();
    const { count } = await supabase
      .from("laudos")
      .select("*", { count: "exact", head: true })
      .eq("tipo_documento", "IN02")
      .contains("dados", { documento: "ressarcimento" })
      .gte("created_at", `${ano}-01-01`)
      .lt("created_at", `${ano + 1}-01-01`);

    codigo = `RES-${ano}-${((count ?? 0) + 1).toString().padStart(3, "0")}`;
  }

  const dados: RessarcimentoWizardState & { documento: "ressarcimento" } = {
    ...state,
    documento: "ressarcimento",
    codigo,
    data_emissao: state.data_emissao || new Date().toISOString(),
  };
  delete dados.laudoId;

  const payload = {
    cliente_id: state.cliente_id,
    tipo_documento: "IN02" as const,
    status: "concluido" as const,
    dados,
  };

  const query = state.laudoId
    ? supabase.from("laudos").update(payload).eq("id", state.laudoId).select().single()
    : supabase.from("laudos").insert(payload).select().single();

  const { data, error } = await query;

  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function listarRessarcimentos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laudos")
    .select("*")
    .eq("tipo_documento", "IN02")
    .contains("dados", { documento: "ressarcimento" })
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as Laudo[] };
  return { data: (data ?? []) as Laudo[] };
}

export async function buscarRessarcimento(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("id", id).single();

  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function excluirRessarcimento(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("laudos").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}
