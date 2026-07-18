"use server";

import { createClient } from "@/lib/supabase/server";
import type { Laudo, Training, TrainingSubtheme } from "@/lib/supabase/types";
import type { PlanoEnsinoWizardState, SubtemaPlano } from "@/lib/plano-ensino/types";

/** Lista os cursos ativos (public.trainings) para o seletor do wizard. */
export async function listarTrainings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainings")
    .select("id,name,total_hours")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) return { error: error.message, data: [] as Pick<Training, "id" | "name" | "total_hours">[] };
  return { data: (data ?? []) as Pick<Training, "id" | "name" | "total_hours">[] };
}

/** Pre-carrega o conteudo programatico a partir dos subtemas ja vinculados ao curso. */
export async function listarSubtemasDoCurso(trainingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_subthemes")
    .select("subtheme_id, sort_order, subtheme:subthemes(id,name,hours)")
    .eq("training_id", trainingId)
    .order("sort_order", { ascending: true });

  if (error) return { error: error.message, data: [] as SubtemaPlano[] };

  const rows = (data ?? []) as unknown as (Pick<TrainingSubtheme, "subtheme_id" | "sort_order"> & {
    subtheme: { id: string; name: string; hours: number } | null;
  })[];

  const conteudo: SubtemaPlano[] = rows.map((r) => ({
    subtheme_id: r.subtheme_id,
    nome: r.subtheme?.name ?? "",
    horas: r.subtheme?.hours ?? 0,
    sort_order: r.sort_order,
  }));

  return { data: conteudo };
}

/** Salva (cria ou atualiza) o plano de ensino, gerando um codigo PE-AAAA-NNN quando novo. */
export async function salvarPlanoEnsino(state: PlanoEnsinoWizardState) {
  const supabase = await createClient();

  let codigo = state.codigo;

  if (!state.laudoId) {
    const ano = new Date().getFullYear();
    const { count } = await supabase
      .from("laudos")
      .select("*", { count: "exact", head: true })
      .eq("tipo_documento", "PlanoEnsino")
      .gte("created_at", `${ano}-01-01`)
      .lt("created_at", `${ano + 1}-01-01`);

    codigo = `PE-${ano}-${((count ?? 0) + 1).toString().padStart(3, "0")}`;
  }

  const dados: PlanoEnsinoWizardState = { ...state, codigo, data_emissao: state.data_emissao || new Date().toISOString() };
  delete dados.laudoId;

  const payload = {
    cliente_id: null,
    tipo_documento: "PlanoEnsino" as const,
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

export async function listarPlanosEnsino() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laudos")
    .select("*")
    .eq("tipo_documento", "PlanoEnsino")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as Laudo[] };
  return { data: (data ?? []) as Laudo[] };
}

export async function buscarPlanoEnsino(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("laudos").select("*").eq("id", id).single();

  if (error) return { error: error.message };
  return { data: data as Laudo };
}

export async function excluirPlanoEnsino(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("laudos").delete().eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}
