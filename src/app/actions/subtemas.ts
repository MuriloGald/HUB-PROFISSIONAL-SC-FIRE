"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ConteudoAula } from "@/lib/treinador/types";

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

export interface NovoCursoInput {
  name: string;
  description: string;
  totalHours: number;
  comboType: string;
  ementa?: string;
  objetivoGeral?: string;
  objetivosEspecificos?: string[];
  metodologia?: string;
  recursosDidaticos?: string;
  criteriosAvaliacao?: string;
  bibliografiaBasica?: string[];
  bibliografiaComplementar?: string[];
}

/** Cria um novo curso (public.trainings), já com o template de ementa/objetivos/etc se informado — os subtemas são adicionados depois na tela do curso. */
export async function criarCurso(input: NovoCursoInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainings")
    .insert({
      name: input.name,
      description: input.description || null,
      total_hours: input.totalHours,
      combo_type: input.comboType || null,
      base_price: 0,
      active: true,
      ementa: input.ementa || null,
      objetivo_geral: input.objetivoGeral || null,
      objetivos_especificos: input.objetivosEspecificos ?? [],
      metodologia: input.metodologia || null,
      recursos_didaticos: input.recursosDidaticos || null,
      criterios_avaliacao: input.criteriosAvaliacao || null,
      bibliografia_basica: input.bibliografiaBasica ?? [],
      bibliografia_complementar: input.bibliografiaComplementar ?? [],
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/treinamentos/cursos");
  revalidatePath("/treinador");
  return { data };
}

export interface CursoTemplate {
  id: string;
  name: string;
  description: string | null;
  total_hours: number;
  combo_type: string | null;
  ementa: string | null;
  objetivo_geral: string | null;
  objetivos_especificos: string[];
  metodologia: string | null;
  recursos_didaticos: string | null;
  criterios_avaliacao: string | null;
  bibliografia_basica: string[];
  bibliografia_complementar: string[];
}

/** Busca o curso com todos os campos, incluindo o template de ementa/objetivos/etc, pro formulário de edição. */
export async function buscarCurso(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainings")
    .select(
      "id,name,description,total_hours,combo_type,ementa,objetivo_geral,objetivos_especificos,metodologia,recursos_didaticos,criterios_avaliacao,bibliografia_basica,bibliografia_complementar"
    )
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { data: data as CursoTemplate };
}

export interface EditarCursoInput {
  name: string;
  description: string;
  totalHours: number;
  comboType: string;
  ementa: string;
  objetivoGeral: string;
  objetivosEspecificos: string[];
  metodologia: string;
  recursosDidaticos: string;
  criteriosAvaliacao: string;
  bibliografiaBasica: string[];
  bibliografiaComplementar: string[];
}

/** Atualiza o curso, incluindo o template de ementa/objetivos/metodologia/bibliografia que o Plano de Ensino reaproveita. */
export async function atualizarCurso(id: string, input: EditarCursoInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("trainings")
    .update({
      name: input.name,
      description: input.description || null,
      total_hours: input.totalHours,
      combo_type: input.comboType || null,
      ementa: input.ementa || null,
      objetivo_geral: input.objetivoGeral || null,
      objetivos_especificos: input.objetivosEspecificos,
      metodologia: input.metodologia || null,
      recursos_didaticos: input.recursosDidaticos || null,
      criterios_avaliacao: input.criteriosAvaliacao || null,
      bibliografia_basica: input.bibliografiaBasica,
      bibliografia_complementar: input.bibliografiaComplementar,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/treinamentos/cursos");
  revalidatePath("/treinador");
  return { success: true };
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

/** Busca o nome + roteiro (conteudo) de um subtema, pro editor de roteiro de aula. */
export async function buscarRoteiro(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subthemes").select("id,name,conteudo").eq("id", id).single();
  if (error) return { error: error.message };
  return { data: { id: data.id as string, name: data.name as string, conteudo: data.conteudo as ConteudoAula | null } };
}

/** Salva o roteiro de aula (Etapas + quiz) de um subtema — é isso que faz o leitor do Treinador funcionar pra ele. */
export async function salvarRoteiro(id: string, conteudo: ConteudoAula) {
  const supabase = await createClient();
  const { error } = await supabase.from("subthemes").update({ conteudo }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/treinamentos/subtemas");
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

/** Troca a posição de um subtema no currículo com o vizinho anterior/seguinte (troca o sort_order dos dois). */
export async function moverSubtemaNoCurso(trainingId: string, subthemeId: string, direcao: "up" | "down") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_subthemes")
    .select("subtheme_id, sort_order")
    .eq("training_id", trainingId)
    .order("sort_order", { ascending: true });

  if (error) return { error: error.message };

  const linhas = data ?? [];
  const idx = linhas.findIndex((r) => r.subtheme_id === subthemeId);
  if (idx === -1) return { error: "Subtema não encontrado neste curso." };

  const idxVizinho = direcao === "up" ? idx - 1 : idx + 1;
  if (idxVizinho < 0 || idxVizinho >= linhas.length) return { success: true };

  const atual = linhas[idx];
  const vizinho = linhas[idxVizinho];

  const [r1, r2] = await Promise.all([
    supabase.from("training_subthemes").update({ sort_order: vizinho.sort_order }).eq("training_id", trainingId).eq("subtheme_id", atual.subtheme_id),
    supabase.from("training_subthemes").update({ sort_order: atual.sort_order }).eq("training_id", trainingId).eq("subtheme_id", vizinho.subtheme_id),
  ]);

  if (r1.error) return { error: r1.error.message };
  if (r2.error) return { error: r2.error.message };

  revalidatePath("/treinamentos/cursos");
  revalidatePath("/treinador");
  return { success: true };
}

/**
 * Move um subtema para uma posição específica (1-based) no currículo do curso e
 * renumera o sort_order de todos sequencialmente (0..N-1) — corrige qualquer
 * duplicata de sort_order que já exista (ex.: subtemas migrados/adicionados com
 * a mesma posição) como efeito colateral, já que ninguém mais fica com o mesmo número.
 */
export async function definirPosicaoSubtema(trainingId: string, subthemeId: string, posicao1Based: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_subthemes")
    .select("subtheme_id, sort_order")
    .eq("training_id", trainingId)
    .order("sort_order", { ascending: true });

  if (error) return { error: error.message };

  const linhas = data ?? [];
  const idxAtual = linhas.findIndex((r) => r.subtheme_id === subthemeId);
  if (idxAtual === -1) return { error: "Subtema não encontrado neste curso." };

  const [item] = linhas.splice(idxAtual, 1);
  const idxDestino = Math.max(0, Math.min(posicao1Based - 1, linhas.length));
  linhas.splice(idxDestino, 0, item);

  const resultados = await Promise.all(
    linhas.map((r, i) =>
      r.sort_order === i
        ? Promise.resolve({ error: null })
        : supabase.from("training_subthemes").update({ sort_order: i }).eq("training_id", trainingId).eq("subtheme_id", r.subtheme_id)
    )
  );
  const falhou = resultados.find((r) => r.error);
  if (falhou?.error) return { error: falhou.error.message };

  revalidatePath("/treinamentos/cursos");
  revalidatePath("/treinador");
  return { success: true };
}
