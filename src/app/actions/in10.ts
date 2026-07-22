"use server";

import { createClient } from "@/lib/supabase/server";
import type { Laudo } from "@/lib/supabase/types";
import type { ControleFumacaState } from "@/lib/in10/types";

/** Salva (cria ou atualiza) o relatório do Sistema de Controle de Fumaça, gerando um código FUM-AAAA-NNN quando novo. */
export async function salvarControleFumaca(state: ControleFumacaState) {
  const supabase = await createClient();

  let codigo = state.codigo;

  if (!state.laudoId) {
    const ano = new Date().getFullYear();
    const { count } = await supabase
      .from("laudos")
      .select("*", { count: "exact", head: true })
      .eq("tipo_documento", "IN10")
      .gte("created_at", `${ano}-01-01`)
      .lt("created_at", `${ano + 1}-01-01`);

    codigo = `FUM-${ano}-${((count ?? 0) + 1).toString().padStart(3, "0")}`;
  }

  const dados: ControleFumacaState = { ...state, codigo, data_emissao: state.data_emissao || new Date().toISOString() };
  delete dados.laudoId;

  const payload = {
    cliente_id: state.cliente_id,
    tipo_documento: "IN10" as const,
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

export async function listarControlesFumaca() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("tipo_documento", "IN10").order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as Laudo[] };
  return { data: (data ?? []) as Laudo[] };
}

export async function buscarControleFumaca(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("id", id).single();

  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function excluirControleFumaca(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("laudos").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}
