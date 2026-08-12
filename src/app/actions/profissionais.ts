"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profissional, RegistroConselhoTipo } from "@/lib/supabase/types";

export interface ProfissionalInput {
  id?: string;
  nome: string;
  cpf?: string;
  telefone: string;
  email: string;
  registro_tipo: RegistroConselhoTipo;
  registro_numero: string;
}

/** Cria ou atualiza um profissional — cadastro unico de Responsaveis Tecnicos consultado por todos os modulos de documento. */
export async function salvarProfissional(input: ProfissionalInput) {
  const supabase = await createClient();

  const payload = {
    nome: input.nome,
    cpf: input.cpf || null,
    telefone: input.telefone || null,
    email: input.email || null,
    registro_tipo: input.registro_tipo,
    registro_numero: input.registro_numero,
  };

  const query = input.id
    ? supabase.from("profissionais").update(payload).eq("id", input.id).select().single()
    : supabase.from("profissionais").insert(payload).select().single();

  const { data, error } = await query;

  if (error) return { error: error.message };
  return { data: data as Profissional };
}

export async function listarProfissionais() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profissionais").select("*").order("nome", { ascending: true });

  if (error) return { error: error.message, data: [] as Profissional[] };
  return { data: (data ?? []) as Profissional[] };
}

export async function buscarProfissional(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profissionais").select("*").eq("id", id).single();

  if (error) return { error: error.message };
  return { data: data as Profissional };
}

export async function excluirProfissional(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("profissionais").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}
