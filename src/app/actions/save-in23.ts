"use server";

import { createClient } from "@/lib/supabase/server";
import type { Cliente, Laudo } from "@/lib/supabase/types";
import type { LaudoTecnicoWizardState, VistoriaWizardState } from "@/lib/save-in23/types";

export interface ClienteSave23Input {
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
  re?: string;
  preexistente?: boolean;
  area_construida?: string;
  pavimentos?: string;
  altura?: string;
  validade_atestado?: string;
}

/** Cria ou atualiza um cliente (edificação com SAVE) do módulo IN 23. */
export async function salvarClienteSave23(input: ClienteSave23Input) {
  const supabase = await createClient();

  const payload = {
    nome: input.razao_social,
    razao_social: input.razao_social,
    cnpj_cpf: input.cnpj || input.cpf || null,
    tipo: "condominio" as const,
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
    re: input.re || null,
    preexistente: input.preexistente ?? null,
    area_construida: input.area_construida || null,
    pavimentos: input.pavimentos || null,
    altura: input.altura || null,
    validade_atestado: input.validade_atestado || null,
  };

  const query = input.id
    ? supabase.from("clientes").update(payload).eq("id", input.id).select().single()
    : supabase.from("clientes").insert(payload).select().single();

  const { data, error } = await query;

  if (error) return { error: error.message };
  return { data: data as Cliente };
}

/**
 * Lista clientes tipo='condominio'. Nota: esse tipo é compartilhado com outros
 * módulos de edificação (Brigada, Habite-se) que venham a reutilizá-lo — sem um
 * discriminador próprio, a listagem aqui pode incluir clientes cadastrados por
 * eles também.
 */
export async function listarClientesSave23() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("tipo", "condominio")
    .order("razao_social", { ascending: true });

  if (error) return { error: error.message, data: [] as Cliente[] };
  return { data: (data ?? []) as Cliente[] };
}

export async function buscarClienteSave23(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clientes").select("*").eq("id", id).single();

  if (error) return { error: error.message };
  return { data: data as Cliente };
}

/**
 * Exclui um cliente permanentemente. ATENÇÃO: laudos.cliente_id tem
 * "on delete cascade" — isso apaga junto todas as vistorias e laudos técnicos
 * vinculados a este cliente. A UI deve confirmar isso explicitamente antes de chamar.
 */
export async function excluirClienteSave23(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clientes").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}

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
