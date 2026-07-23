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

/** Achata as questões de verificação de todos os subtemas do curso — vira o banco de perguntas da Avaliação. */
export async function buscarQuestoesAvaliacao(trainingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_subthemes")
    .select("sort_order,subtheme:subthemes(name,conteudo)")
    .eq("training_id", trainingId)
    .order("sort_order", { ascending: true });

  if (error) return { error: error.message, data: [] as QuestaoAvaliacao[] };

  const rows = (data ?? []) as unknown as { subtheme: { name: string; conteudo: ConteudoAula | null } | null }[];
  const questoes: QuestaoAvaliacao[] = [];
  for (const r of rows) {
    const perguntas = r.subtheme?.conteudo?.verificacao?.questoes ?? [];
    for (const q of perguntas) {
      questoes.push({ subtemaNome: r.subtheme?.name ?? "", pergunta: q.pergunta, opcoes: q.opcoes });
    }
  }

  return { data: questoes };
}

/** Verifica se o aluno já respondeu a avaliação desta turma (pra mostrar o resultado em vez do formulário de novo). */
export async function buscarAvaliacaoDoAluno(classId: string, studentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("avaliacao_respostas")
    .select("respostas,acertos,total")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (!data) return { data: null };
  return { data: data as unknown as AvaliacaoResultado };
}

/** Recebe as respostas do aluno, recalcula o score no servidor (não confia no cliente) e grava. */
export async function enviarAvaliacao(classId: string, studentId: string, trainingId: string, respostas: number[]) {
  const { data: questoes, error: errQuestoes } = await buscarQuestoesAvaliacao(trainingId);
  if (errQuestoes) return { error: errQuestoes };

  let acertos = 0;
  questoes.forEach((q, i) => {
    const indiceEscolhido = respostas[i];
    if (indiceEscolhido !== undefined && q.opcoes[indiceEscolhido]?.correta) acertos++;
  });

  const supabase = await createClient();
  const { error } = await supabase.from("avaliacao_respostas").insert({
    class_id: classId,
    student_id: studentId,
    respostas,
    acertos,
    total: questoes.length,
  });

  if (error) {
    if (error.code === "23505") return { error: "Você já respondeu a avaliação desta turma." };
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
