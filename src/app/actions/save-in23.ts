"use server";

import { createClient } from "@/lib/supabase/server";
import type { Laudo } from "@/lib/supabase/types";
import type { LaudoTecnicoWizardState, VistoriaWizardState } from "@/lib/save-in23/types";

/** Salva (cria ou atualiza) a Vistoria de Campo, gerando um código V-AAAA-NNN quando nova. */
export async function salvarVistoria(state: VistoriaWizardState) {
  const supabase = await createClient();

  let codigo = state.codigo;

  if (!state.laudoId) {
    const ano = new Date().getFullYear();
    const { count } = await supabase
      .from("laudos")
      .select("*", { count: "exact", head: true })
      .eq("tipo_documento", "SAVE23")
      .contains("dados", { fluxo: "vistoria" })
      .gte("created_at", `${ano}-01-01`)
      .lt("created_at", `${ano + 1}-01-01`);

    codigo = `V-${ano}-${((count ?? 0) + 1).toString().padStart(3, "0")}`;
  }

  const dados: VistoriaWizardState & { fluxo: "vistoria" } = {
    ...state,
    fluxo: "vistoria",
    codigo,
    data_emissao: state.data_emissao || new Date().toISOString(),
  };
  delete dados.laudoId;

  const payload = {
    cliente_id: state.cliente_id,
    tipo_documento: "SAVE23" as const,
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

export async function listarVistorias() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laudos")
    .select("*")
    .eq("tipo_documento", "SAVE23")
    .contains("dados", { fluxo: "vistoria" })
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as Laudo[] };
  return { data: (data ?? []) as Laudo[] };
}

export async function buscarVistoria(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("id", id).single();

  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function excluirVistoria(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("laudos").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

/** Salva (cria ou atualiza) o Laudo Técnico / Orientação Técnica, gerando um código L-AAAA-NNN quando novo. */
export async function salvarLaudoTecnico(state: LaudoTecnicoWizardState) {
  const supabase = await createClient();

  let codigo = state.codigo;

  if (!state.laudoId) {
    const ano = new Date().getFullYear();
    const { count } = await supabase
      .from("laudos")
      .select("*", { count: "exact", head: true })
      .eq("tipo_documento", "SAVE23")
      .contains("dados", { fluxo: "laudo" })
      .gte("created_at", `${ano}-01-01`)
      .lt("created_at", `${ano + 1}-01-01`);

    codigo = `L-${ano}-${((count ?? 0) + 1).toString().padStart(3, "0")}`;
  }

  const dados: LaudoTecnicoWizardState & { fluxo: "laudo" } = {
    ...state,
    fluxo: "laudo",
    codigo,
    data_emissao: state.data_emissao || new Date().toISOString(),
  };
  delete dados.laudoId;

  const payload = {
    cliente_id: state.cliente_id,
    tipo_documento: "SAVE23" as const,
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

export async function listarLaudosTecnicos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laudos")
    .select("*")
    .eq("tipo_documento", "SAVE23")
    .contains("dados", { fluxo: "laudo" })
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as Laudo[] };
  return { data: (data ?? []) as Laudo[] };
}

export async function buscarLaudoTecnico(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("id", id).single();

  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function excluirLaudoTecnico(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("laudos").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

/** Lista as clausulas padrao ativas do Capitulo 2, na ordem cadastrada. */
export async function listarClausulasPadrao() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("save23_clausulas_padrao")
    .select("*")
    .eq("active", true)
    .order("ordem", { ascending: true });

  if (error) return { error: error.message, data: [] as { id: string; titulo: string; texto: string }[] };
  return { data: data ?? [] };
}
