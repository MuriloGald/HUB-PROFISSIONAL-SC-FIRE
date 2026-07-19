"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface SubtemaListado {
  id: string;
  name: string;
  category: string;
  level: string;
  hours: number;
  active: boolean;
  temConteudo: boolean;
  cursoVinculado: string | null;
}

/** Lista todo o catálogo de subtemas, com o nome do curso vinculado (se houver). */
export async function listarSubtemas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subthemes")
    .select("id,name,category,level,hours,active,conteudo,training_subthemes(training:trainings(name))")
    .order("level", { ascending: true })
    .order("name", { ascending: true });

  if (error) return { error: error.message, data: [] as SubtemaListado[] };

  const rows = (data ?? []) as unknown as {
    id: string;
    name: string;
    category: string;
    level: string;
    hours: number;
    active: boolean;
    conteudo: unknown;
    training_subthemes: { training: { name: string } | null }[] | null;
  }[];

  const subtemas: SubtemaListado[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    level: r.level,
    hours: r.hours,
    active: r.active,
    temConteudo: Boolean(r.conteudo),
    cursoVinculado: r.training_subthemes?.[0]?.training?.name ?? null,
  }));

  return { data: subtemas };
}

/** Lista os cursos ativos, pro seletor "vincular a um curso" do formulário de novo subtema. */
export async function listarCursosParaVinculo() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainings").select("id,name").eq("active", true).order("name", { ascending: true });
  if (error) return { error: error.message, data: [] as { id: string; name: string }[] };
  return { data: data ?? [] };
}

export interface NovoSubtemaInput {
  name: string;
  category: string;
  level: string;
  hours: number;
  description: string;
  canvaEmbed: string;
  trainingId: string | null;
  sortOrder: number | null;
}

/** Cria um novo subtema no catálogo e, se informado, vincula a um curso na posição indicada. */
export async function criarSubtema(input: NovoSubtemaInput) {
  const supabase = await createClient();

  const { data: subtema, error } = await supabase
    .from("subthemes")
    .insert({
      name: input.name,
      category: input.category,
      level: input.level,
      hours: input.hours,
      price: 0,
      description: input.description || null,
      canva_embed: input.canvaEmbed || null,
      active: true,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (input.trainingId) {
    const { error: vinculoError } = await supabase.from("training_subthemes").insert({
      training_id: input.trainingId,
      subtheme_id: subtema.id,
      sort_order: input.sortOrder ?? 0,
      is_mandatory: true,
    });
    if (vinculoError) return { error: `Subtema criado, mas falhou ao vincular ao curso: ${vinculoError.message}` };
  }

  revalidatePath("/treinamentos/subtemas");
  revalidatePath("/treinamentos/cursos");
  revalidatePath("/treinador");
  return { data: subtema };
}

/** Busca um subtema pelo id, pro formulário de edição. */
export async function buscarSubtema(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subthemes").select("id,name,category,level,hours,description,canva_embed").eq("id", id).single();
  if (error) return { error: error.message };
  return { data };
}

export interface EditarSubtemaInput {
  name: string;
  category: string;
  level: string;
  hours: number;
  description: string;
  canvaEmbed: string;
}

/** Atualiza os dados de um subtema já existente (nome, módulo, nível, carga horária, descrição, link do Canva). */
export async function atualizarSubtema(id: string, input: EditarSubtemaInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("subthemes")
    .update({
      name: input.name,
      category: input.category,
      level: input.level,
      hours: input.hours,
      description: input.description || null,
      canva_embed: input.canvaEmbed || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/treinamentos/subtemas");
  revalidatePath("/treinamentos/cursos");
  revalidatePath("/treinador");
  return { success: true };
}

/** Só a carga horária — usado pela edição inline dentro da página do curso. */
export async function atualizarDuracaoSubtema(id: string, hours: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("subthemes").update({ hours }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/treinamentos/subtemas");
  revalidatePath("/treinamentos/cursos");
  revalidatePath("/treinador");
  return { success: true };
}

/** Exclui o subtema do catálogo (o ON DELETE CASCADE em training_subthemes remove o vínculo com qualquer curso junto). */
export async function excluirSubtema(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("subthemes").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/treinamentos/subtemas");
  revalidatePath("/treinamentos/cursos");
  revalidatePath("/treinador");
  return { success: true };
}

export interface SubtemaDoCurso {
  id: string;
  name: string;
  category: string;
  hours: number;
  sortOrder: number;
}

/** Curso + subtemas já vinculados (ordenados) + subtemas do catálogo ainda não vinculados a ele. */
export async function listarCursoDetalhe(trainingId: string) {
  const supabase = await createClient();

  const [cursoRes, vinculadosRes, todosRes] = await Promise.all([
    supabase.from("trainings").select("id,name,description,total_hours").eq("id", trainingId).single(),
    supabase
      .from("training_subthemes")
      .select("sort_order, subtheme:subthemes(id,name,category,hours)")
      .eq("training_id", trainingId)
      .order("sort_order", { ascending: true }),
    supabase.from("subthemes").select("id,name,category,level").eq("active", true).order("name", { ascending: true }),
  ]);

  const curso = cursoRes.data as { id: string; name: string; description: string | null; total_hours: number } | null;

  const vinculadosRows = (vinculadosRes.data ?? []) as unknown as {
    sort_order: number;
    subtheme: { id: string; name: string; category: string; hours: number } | null;
  }[];
  const subtemasDoCurso: SubtemaDoCurso[] = vinculadosRows
    .filter((r) => r.subtheme)
    .map((r) => ({ id: r.subtheme!.id, name: r.subtheme!.name, category: r.subtheme!.category, hours: r.subtheme!.hours, sortOrder: r.sort_order }));

  const idsVinculados = new Set(subtemasDoCurso.map((s) => s.id));
  const disponiveisParaAdicionar = ((todosRes.data ?? []) as { id: string; name: string; category: string; level: string }[]).filter(
    (s) => !idsVinculados.has(s.id)
  );

  return { curso, subtemasDoCurso, disponiveisParaAdicionar };
}

/** Vincula um subtema já existente do catálogo a este curso, numa posição do currículo. */
export async function adicionarSubtemaAoCurso(trainingId: string, subthemeId: string, sortOrder: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("training_subthemes").insert({
    training_id: trainingId,
    subtheme_id: subthemeId,
    sort_order: sortOrder,
    is_mandatory: true,
  });
  if (error) return { error: error.message };

  revalidatePath("/treinamentos/cursos");
  revalidatePath("/treinador");
  return { success: true };
}

/** Remove o subtema do curso (desvincula — o subtema continua existindo no catálogo). */
export async function removerSubtemaDoCurso(trainingId: string, subthemeId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("training_subthemes").delete().eq("training_id", trainingId).eq("subtheme_id", subthemeId);
  if (error) return { error: error.message };

  revalidatePath("/treinamentos/cursos");
  revalidatePath("/treinador");
  return { success: true };
}
