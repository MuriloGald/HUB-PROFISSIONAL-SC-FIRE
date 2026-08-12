"use server";

import { createClient } from "@/lib/supabase/server";
import type { ConteudoAula } from "@/lib/treinador/types";
import type { AvaliacaoResultado, QuestaoAvaliacao, TurmaAva } from "@/lib/ava/types";

/** Busca a turma pelo token do QR (mesmo QR do check-in) — usada pelo Ambiente Virtual de Aprendizagem do aluno. */
export async function buscarTurmaParaAva(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id,status,training:trainings(id,name),cliente:clientes(nome,razao_social)")
    .eq("qr_code_token", token)
    .single();

  if (error) return { error: "Turma não encontrada. Verifique o QR Code com o instrutor." };

  const row = data as unknown as {
    id: string;
    status: string;
    training: { id: string; name: string } | null;
    cliente: { nome: string; razao_social: string | null } | null;
  };

  const turma: TurmaAva = {
    id: row.id,
    status: row.status,
    trainingId: row.training?.id ?? "",
    trainingName: row.training?.name ?? "",
    clienteNome: row.cliente ? row.cliente.razao_social || row.cliente.nome : null,
  };

  return { data: turma };
}

function seededShuffle<T>(array: T[], seedStr: string): T[] {
  const result = [...array];
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = (Math.imul(31, h) + seedStr.charCodeAt(i)) | 0;
  }
  const random = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export type FaseAvaliacao = "incendio" | "primeiros_socorros";

/** Achata as questões de verificação filtrando pela fase (incendio x primeiros_socorros) e sorteia no máximo `limit` questões (padrão 10). */
export async function buscarQuestoesAvaliacao(
  trainingId: string,
  studentId?: string,
  fase: FaseAvaliacao = "incendio",
  limit = 10
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_subthemes")
    .select("sort_order,subtheme:subthemes(name,category,conteudo)")
    .eq("training_id", trainingId)
    .order("sort_order", { ascending: true });

  if (error) return { error: error.message, data: [] as QuestaoAvaliacao[] };

  const rows = (data ?? []) as unknown as {
    subtheme: { name: string; category: string; conteudo: ConteudoAula | null } | null;
  }[];

  const banco: QuestaoAvaliacao[] = [];
  for (const r of rows) {
    if (!r.subtheme) continue;
    const cat = (r.subtheme.category || r.subtheme.conteudo?.modulo || "").toLowerCase();
    const subName = (r.subtheme.name || "").toLowerCase();

    const isPrimeirosSocorros =
      cat.includes("socorro") ||
      cat.includes("aph") ||
      subName.includes("b4") ||
      subName.includes("b5") ||
      subName.includes("b6") ||
      subName.includes("socorros");

    if (fase === "primeiros_socorros" && !isPrimeirosSocorros) continue;
    if (fase === "incendio" && isPrimeirosSocorros) continue;

    const perguntas = r.subtheme.conteudo?.verificacao?.questoes ?? [];
    for (const q of perguntas) {
      banco.push({ subtemaNome: r.subtheme.name ?? "", pergunta: q.pergunta, opcoes: q.opcoes });
    }
  }

  let questoes = banco;
  if (questoes.length > limit) {
    const seed = studentId ? `${studentId}_${fase}` : undefined;
    if (seed) {
      questoes = seededShuffle(banco, seed).slice(0, limit);
    } else {
      questoes = banco.slice(0, limit);
    }
  }

  return { data: questoes };
}

/** Busca os resultados de todas as fases já respondidas pelo aluno nesta turma. */
export async function buscarTodasAvaliacoesDoAluno(classId: string, studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("avaliacao_respostas")
    .select("fase,respostas,acertos,total")
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (error) {
    // Se a coluna 'fase' ainda não foi criada no Supabase via migration, busca sem ela
    const fallback = await supabase
      .from("avaliacao_respostas")
      .select("respostas,acertos,total")
      .eq("class_id", classId)
      .eq("student_id", studentId);

    const porFase: Record<string, AvaliacaoResultado> = {};
    if (fallback.data && fallback.data.length > 0) {
      const item = fallback.data[0] as unknown as { respostas: number[]; acertos: number; total: number };
      porFase["incendio"] = { acertos: item.acertos, total: item.total, respostas: item.respostas };
    }
    return { data: porFase };
  }

  const porFase: Record<string, AvaliacaoResultado> = {};
  (data ?? []).forEach((r) => {
    const item = r as unknown as { fase?: string; respostas: number[]; acertos: number; total: number };
    porFase[item.fase || "incendio"] = { acertos: item.acertos, total: item.total, respostas: item.respostas };
  });

  return { data: porFase };
}

/** Recebe as respostas do aluno para uma determinada fase, recalcula o score e grava. */
export async function enviarAvaliacao(
  classId: string,
  studentId: string,
  trainingId: string,
  respostas: number[],
  fase: FaseAvaliacao = "incendio"
) {
  const { data: questoes, error: errQuestoes } = await buscarQuestoesAvaliacao(trainingId, studentId, fase, 10);
  if (errQuestoes) return { error: errQuestoes };

  let acertos = 0;
  questoes.forEach((q, i) => {
    const indiceEscolhido = respostas[i];
    if (indiceEscolhido !== undefined && q.opcoes[indiceEscolhido]?.correta) acertos++;
  });

  const supabase = await createClient();

  // Tenta salvar incluindo a coluna 'fase'
  let { error } = await supabase.from("avaliacao_respostas").insert({
    class_id: classId,
    student_id: studentId,
    fase,
    respostas,
    acertos,
    total: questoes.length,
  });

  // Se der erro porque a coluna 'fase' ainda não foi criada no banco, faz o fallback salvando sem a coluna 'fase'
  if (error && (error.message.includes("fase") || error.code === "PGRST204" || error.code === "42703")) {
    const fallback = await supabase.from("avaliacao_respostas").insert({
      class_id: classId,
      student_id: studentId,
      respostas,
      acertos,
      total: questoes.length,
    });
    error = fallback.error;
  }

  if (error) {
    if (error.code === "23505") return { error: "Você já respondeu a esta avaliação." };
    return { error: error.message };
  }

  return { data: { acertos, total: questoes.length, respostas } as AvaliacaoResultado };
}

export interface PesquisaSalva {
  notas: number[];
  comentario: string | null;
}

/** Verifica se o aluno já respondeu a pesquisa de satisfação desta turma. */
export async function buscarPesquisaDoAluno(classId: string, studentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pesquisas_satisfacao")
    .select("notas,comentario")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (!data) return { data: null };
  return { data: data as unknown as PesquisaSalva };
}

/** Grava a pesquisa de satisfação do aluno para esta turma. */
export async function enviarPesquisaSatisfacao(classId: string, studentId: string, notas: number[], comentario: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pesquisas_satisfacao").insert({
    class_id: classId,
    student_id: studentId,
    notas,
    comentario: comentario.trim() || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "Você já respondeu a pesquisa de satisfação desta turma." };
    return { error: error.message };
  }

  return { success: true };
}
