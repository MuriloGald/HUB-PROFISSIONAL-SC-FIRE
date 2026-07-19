"use server";

import { createClient } from "@/lib/supabase/server";
import type { AulaResumo, ConteudoAula, CursoTreinador } from "@/lib/treinador/types";

/** Lista os cursos ativos disponíveis pro leitor do treinador. */
export async function listarCursosTreinador() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainings")
    .select("id,name,description,total_hours")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) return { error: error.message, data: [] as CursoTreinador[] };
  return { data: (data ?? []) as CursoTreinador[] };
}

/** Lista as aulas de um curso, na ordem do currículo, indicando quais já têm roteiro migrado. */
export async function listarAulasDoCurso(trainingId: string) {
  const supabase = await createClient();
  const [cursoRes, aulasRes] = await Promise.all([
    supabase.from("trainings").select("id,name,description,total_hours").eq("id", trainingId).single(),
    supabase
      .from("training_subthemes")
      .select("sort_order, subtheme:subthemes(id,name,category,hours,conteudo,canva_embed)")
      .eq("training_id", trainingId)
      .order("sort_order", { ascending: true }),
  ]);

  const curso = cursoRes.data as CursoTreinador | null;
  const { data, error } = aulasRes;

  if (error) return { error: error.message, curso, data: [] as AulaResumo[] };

  const rows = (data ?? []) as unknown as {
    sort_order: number;
    subtheme: { id: string; name: string; category: string; hours: number; conteudo: unknown; canva_embed: string | null } | null;
  }[];

  const aulas: AulaResumo[] = rows
    .filter((r) => r.subtheme)
    .map((r) => ({
      id: r.subtheme!.id,
      name: r.subtheme!.name,
      category: r.subtheme!.category,
      hours: r.subtheme!.hours,
      sort_order: r.sort_order,
      temConteudo: Boolean(r.subtheme!.conteudo),
      canvaEmbed: r.subtheme!.canva_embed,
    }));

  return { curso, data: aulas };
}

/** Busca o roteiro completo de uma aula (Etapas + quiz) pro leitor. */
export async function buscarAula(subthemeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subthemes")
    .select("id,name,category,hours,conteudo")
    .eq("id", subthemeId)
    .single();

  if (error) return { error: error.message };

  return {
    data: {
      id: data.id as string,
      name: data.name as string,
      category: data.category as string,
      hours: data.hours as number,
      conteudo: data.conteudo as ConteudoAula | null,
    },
  };
}
