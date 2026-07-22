"use server";

import { createClient } from "@/lib/supabase/server";
import type { Laudo } from "@/lib/supabase/types";
import type { PibiState, RelatorioFormacaoState, RelatorioPrestacaoState } from "@/lib/in28/types";

async function proximoCodigo(supabase: Awaited<ReturnType<typeof createClient>>, documento: string, prefixo: string) {
  const ano = new Date().getFullYear();
  const { count } = await supabase
    .from("laudos")
    .select("*", { count: "exact", head: true })
    .eq("tipo_documento", "IN28")
    .contains("dados", { documento })
    .gte("created_at", `${ano}-01-01`)
    .lt("created_at", `${ano + 1}-01-01`);

  return `${prefixo}-${ano}-${((count ?? 0) + 1).toString().padStart(3, "0")}`;
}

/** Salva (cria ou atualiza) o PIBI, gerando um código PIBI-AAAA-NNN quando novo. */
export async function salvarPibi(state: PibiState) {
  const supabase = await createClient();
  const codigo = state.codigo ?? (!state.laudoId ? await proximoCodigo(supabase, "pibi", "PIBI") : undefined);

  const dados: PibiState & { documento: "pibi" } = { ...state, documento: "pibi", codigo, data_emissao: state.data_emissao || new Date().toISOString() };
  delete dados.laudoId;

  const payload = { cliente_id: state.cliente_id, tipo_documento: "IN28" as const, status: "concluido" as const, dados };
  const query = state.laudoId
    ? supabase.from("laudos").update(payload).eq("id", state.laudoId).select().single()
    : supabase.from("laudos").insert(payload).select().single();

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function listarPibis() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("tipo_documento", "IN28").contains("dados", { documento: "pibi" }).order("created_at", { ascending: false });
  if (error) return { error: error.message, data: [] as Laudo[] };
  return { data: (data ?? []) as Laudo[] };
}

export async function buscarPibi(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("id", id).single();
  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function excluirPibi(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("laudos").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

/** Salva (cria ou atualiza) o Relatório de Empresas de Formação de Brigadistas, gerando um código FORM-AAAA-NNN quando novo. */
export async function salvarRelatorioFormacao(state: RelatorioFormacaoState) {
  const supabase = await createClient();
  const codigo = state.codigo ?? (!state.laudoId ? await proximoCodigo(supabase, "formacao", "FORM") : undefined);

  const dados: RelatorioFormacaoState & { documento: "formacao" } = {
    ...state,
    documento: "formacao",
    codigo,
    data_emissao: state.data_emissao || new Date().toISOString(),
  };
  delete dados.laudoId;

  const payload = { cliente_id: state.cliente_id, tipo_documento: "IN28" as const, status: "concluido" as const, dados };
  const query = state.laudoId
    ? supabase.from("laudos").update(payload).eq("id", state.laudoId).select().single()
    : supabase.from("laudos").insert(payload).select().single();

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function listarRelatoriosFormacao() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("tipo_documento", "IN28").contains("dados", { documento: "formacao" }).order("created_at", { ascending: false });
  if (error) return { error: error.message, data: [] as Laudo[] };
  return { data: (data ?? []) as Laudo[] };
}

export async function buscarRelatorioFormacao(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("id", id).single();
  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function excluirRelatorioFormacao(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("laudos").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

/** Salva (cria ou atualiza) o Relatório de Empresas de Prestação de Serviço de Brigadistas, gerando um código PREST-AAAA-NNN quando novo. */
export async function salvarRelatorioPrestacao(state: RelatorioPrestacaoState) {
  const supabase = await createClient();
  const codigo = state.codigo ?? (!state.laudoId ? await proximoCodigo(supabase, "prestacao", "PREST") : undefined);

  const dados: RelatorioPrestacaoState & { documento: "prestacao" } = {
    ...state,
    documento: "prestacao",
    codigo,
    data_emissao: state.data_emissao || new Date().toISOString(),
  };
  delete dados.laudoId;

  const payload = { cliente_id: state.cliente_id, tipo_documento: "IN28" as const, status: "concluido" as const, dados };
  const query = state.laudoId
    ? supabase.from("laudos").update(payload).eq("id", state.laudoId).select().single()
    : supabase.from("laudos").insert(payload).select().single();

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function listarRelatoriosPrestacao() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("tipo_documento", "IN28").contains("dados", { documento: "prestacao" }).order("created_at", { ascending: false });
  if (error) return { error: error.message, data: [] as Laudo[] };
  return { data: (data ?? []) as Laudo[] };
}

export async function buscarRelatorioPrestacao(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("id", id).single();
  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function excluirRelatorioPrestacao(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("laudos").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}
