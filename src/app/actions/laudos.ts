"use server";

import { createClient } from "@/lib/supabase/server";
import type { Cliente, Laudo } from "@/lib/supabase/types";
import type { EventoWizardState } from "@/lib/laudos/types";

export interface ClienteEventoInput {
  id?: string;
  cnpj?: string;
  cpf?: string;
  razao_social: string;
  nome_responsavel: string;
  telefone: string;
  email: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: string;
  complemento?: string;
}

/** Cria ou atualiza um cliente organizador de evento (tipo = 'evento'). */
export async function salvarClienteEvento(input: ClienteEventoInput) {
  const supabase = await createClient();

  const payload = {
    nome: input.razao_social,
    razao_social: input.razao_social,
    cnpj_cpf: input.cnpj || input.cpf || null,
    tipo: "evento" as const,
    responsavel_nome: input.nome_responsavel,
    email: input.email,
    telefone: input.telefone,
    endereco: `${input.logradouro}, ${input.numero}`,
    logradouro: input.logradouro,
    numero: input.numero,
    bairro: input.bairro,
    complemento: input.complemento || null,
    cidade: input.cidade,
    estado: input.estado,
    cep: input.cep,
  };

  const query = input.id
    ? supabase.from("clientes").update(payload).eq("id", input.id).select().single()
    : supabase.from("clientes").insert(payload).select().single();

  const { data, error } = await query;

  if (error) return { error: error.message };
  return { data: data as Cliente };
}

export async function listarClientesEvento() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("tipo", "evento")
    .order("razao_social", { ascending: true });

  if (error) return { error: error.message, data: [] as Cliente[] };
  return { data: (data ?? []) as Cliente[] };
}

/** Salva (cria ou atualiza) o laudo de evento IN 24, gerando um codigo EVT-AAAA-NNN quando novo. */
export async function salvarLaudoEvento(state: EventoWizardState) {
  const supabase = await createClient();

  let codigo = state.codigo;

  if (!state.laudoId) {
    const ano = new Date().getFullYear();
    const { count } = await supabase
      .from("laudos")
      .select("*", { count: "exact", head: true })
      .eq("tipo_documento", "IN24")
      .gte("created_at", `${ano}-01-01`)
      .lt("created_at", `${ano + 1}-01-01`);

    codigo = `EVT-${ano}-${((count ?? 0) + 1).toString().padStart(3, "0")}`;
  }

  const dados: EventoWizardState = { ...state, codigo, data_emissao: state.data_emissao || new Date().toISOString() };
  delete dados.laudoId;

  const payload = {
    cliente_id: state.cliente_id,
    tipo_documento: "IN24" as const,
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

export async function listarLaudosEvento() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laudos")
    .select("*")
    .eq("tipo_documento", "IN24")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as Laudo[] };
  return { data: (data ?? []) as Laudo[] };
}

export async function buscarLaudoEvento(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("id", id).single();

  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function excluirLaudoEvento(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("laudos").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}
