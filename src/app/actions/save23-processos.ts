"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EstagioProcesso, ProcessoSave23 } from "@/lib/save23-processos/types";

const PROCESSOS_PATH = "/relatorios/save-in23/processos";

/** Lista as colunas do kanban (editáveis pelo usuário), na ordem cadastrada. */
export async function listarEstagiosProcesso() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("save23_estagios").select("*").order("ordem", { ascending: true });

  if (error) return { error: error.message, data: [] as EstagioProcesso[] };
  return { data: (data ?? []) as EstagioProcesso[] };
}

/** Cria uma nova coluna ao final do quadro. */
export async function criarEstagioProcesso(nome: string) {
  const supabase = await createClient();
  const { data: existentes } = await supabase.from("save23_estagios").select("ordem").order("ordem", { ascending: false }).limit(1);
  const proximaOrdem = (existentes?.[0]?.ordem ?? 0) + 1;

  const { data, error } = await supabase.from("save23_estagios").insert({ nome: nome.trim(), ordem: proximaOrdem }).select().single();
  if (error) return { error: error.message };

  revalidatePath(PROCESSOS_PATH);
  return { data: data as EstagioProcesso };
}

/** Renomeia uma coluna existente. */
export async function renomearEstagioProcesso(id: string, nome: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("save23_estagios").update({ nome: nome.trim() }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(PROCESSOS_PATH);
  return { success: true };
}

/** Troca a ordem de duas colunas adjacentes (mover pra esquerda/direita). */
export async function trocarOrdemEstagios(idA: string, ordemA: number, idB: string, ordemB: number) {
  const supabase = await createClient();
  const [{ error: erroA }, { error: erroB }] = await Promise.all([
    supabase.from("save23_estagios").update({ ordem: ordemB }).eq("id", idA),
    supabase.from("save23_estagios").update({ ordem: ordemA }).eq("id", idB),
  ]);
  if (erroA || erroB) return { error: erroA?.message || erroB?.message };

  revalidatePath(PROCESSOS_PATH);
  return { success: true };
}

/** Exclui uma coluna — bloqueado pelo banco (on delete restrict) se ainda houver processos nela. */
export async function excluirEstagioProcesso(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("save23_estagios").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") return { error: "Mova os condomínios desta etapa para outra coluna antes de excluí-la." };
    return { error: error.message };
  }

  revalidatePath(PROCESSOS_PATH);
  return { success: true };
}

/** Lista os processos (condomínios em atendimento) do quadro. */
export async function listarProcessosSave23() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("save23_processos").select("*").order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as ProcessoSave23[] };
  return { data: (data ?? []) as ProcessoSave23[] };
}

export interface NovoProcessoInput {
  clienteId: string;
  estagioId: string;
  responsavel: string;
  observacoes: string;
}

/** Inicia o acompanhamento de um condomínio (cliente já cadastrado) no quadro. */
export async function criarProcessoSave23(input: NovoProcessoInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("save23_processos")
    .insert({
      cliente_id: input.clienteId,
      estagio_id: input.estagioId,
      responsavel: input.responsavel.trim() || null,
      observacoes: input.observacoes.trim() || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(PROCESSOS_PATH);
  return { data: data as ProcessoSave23 };
}

/** Move o card pra outra coluna (drag-and-drop do kanban). */
export async function moverProcessoSave23(id: string, estagioId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("save23_processos").update({ estagio_id: estagioId, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(PROCESSOS_PATH);
  return { success: true };
}

export interface EditarProcessoInput {
  responsavel: string;
  observacoes: string;
}

/** Atualiza responsável/observações do processo — editado na drawer de detalhe. */
export async function atualizarProcessoSave23(id: string, input: EditarProcessoInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("save23_processos")
    .update({ responsavel: input.responsavel.trim() || null, observacoes: input.observacoes.trim() || null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(PROCESSOS_PATH);
  return { success: true };
}

/** Encerra o acompanhamento do condomínio (ex: caso encerrado/cancelado). */
export async function excluirProcessoSave23(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("save23_processos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(PROCESSOS_PATH);
  return { success: true };
}
