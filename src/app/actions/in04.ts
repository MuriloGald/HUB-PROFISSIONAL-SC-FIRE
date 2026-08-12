"use server";

import { createClient } from "@/lib/supabase/server";
import type { Laudo } from "@/lib/supabase/types";
import type { VistoriaManutencaoState } from "@/lib/in04/types";

/** Salva (cria ou atualiza) a Vistoria de Manutenção do SMSCI (IN 04), gerando um código VM-AAAA-NNN quando nova. */
export async function salvarVistoriaManutencao(state: VistoriaManutencaoState) {
  const supabase = await createClient();

  let codigo = state.codigo;

  if (!state.laudoId) {
    const ano = new Date().getFullYear();
    const { count } = await supabase
      .from("laudos")
      .select("*", { count: "exact", head: true })
      .eq("tipo_documento", "IN04")
      .gte("created_at", `${ano}-01-01`)
      .lt("created_at", `${ano + 1}-01-01`);

    codigo = `VM-${ano}-${((count ?? 0) + 1).toString().padStart(3, "0")}`;
  }

  const dados: VistoriaManutencaoState = { ...state, codigo, data_emissao: state.data_emissao || new Date().toISOString() };
  delete dados.laudoId;

  const payload = {
    cliente_id: state.cliente_id,
    tipo_documento: "IN04" as const,
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

export async function listarVistoriasManutencao() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laudos")
    .select("*")
    .eq("tipo_documento", "IN04")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as Laudo[] };
  return { data: (data ?? []) as Laudo[] };
}

/** Busca a Vistoria de Manutenção (IN 04) mais recente de um cliente, para pré-preencher Laudos Técnicos decorrentes. */
export async function buscarUltimaVistoriaManutencaoPorCliente(clienteId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laudos")
    .select("*")
    .eq("tipo_documento", "IN04")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  return { data: data as Laudo | null };
}

export async function buscarVistoriaManutencao(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("id", id).single();

  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function excluirVistoriaManutencao(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("laudos").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}
