"use server";

import { createClient } from "@/lib/supabase/server";
import type { Cliente, ClienteTipo } from "@/lib/supabase/types";

export interface ClienteInput {
  id?: string;
  cnpj?: string;
  cpf?: string;
  razao_social: string;
  tipo?: ClienteTipo;
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

/** Cria ou atualiza um cliente — base unica consultada por todos os modulos de documento. */
export async function salvarCliente(input: ClienteInput) {
  const supabase = await createClient();

  const payload = {
    nome: input.razao_social,
    razao_social: input.razao_social,
    cnpj_cpf: input.cnpj || input.cpf || null,
    tipo: input.tipo ?? "outro",
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

export async function listarClientes() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clientes").select("*").order("razao_social", { ascending: true });

  if (error) return { error: error.message, data: [] as Cliente[] };
  return { data: (data ?? []) as Cliente[] };
}

export async function buscarCliente(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clientes").select("*").eq("id", id).single();

  if (error) return { error: error.message };
  return { data: data as Cliente };
}

/**
 * Exclui um cliente permanentemente. ATENÇÃO: laudos.cliente_id tem
 * "on delete cascade" — isso apaga junto TODOS os documentos (de qualquer
 * módulo) vinculados a este cliente. A UI deve confirmar isso explicitamente.
 */
export async function excluirCliente(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clientes").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}
