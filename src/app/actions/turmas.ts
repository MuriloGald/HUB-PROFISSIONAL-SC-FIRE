"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buscarCurso } from "./subtemas";
import { listarSubtemasDoCurso, salvarPlanoEnsino } from "./plano-ensino";
import { buscarCliente } from "./clientes";
import { formatarDataDia } from "@/lib/plano-ensino/formatters";
import { PERGUNTAS_PESQUISA_SATISFACAO } from "@/lib/ava/types";
import type { PlanoEnsinoWizardState } from "@/lib/plano-ensino/types";
import type { PresencaRegistrada, Student, Turma, TurmaComDetalhes } from "@/lib/turmas/types";
import type { RelatorioTurmaData } from "@/lib/turmas/relatorio-types";

/** Lista turmas agendadas ou em andamento, com nome do curso e do cliente — pro seletor de "Turma Cadastrada". */
export async function listarTurmas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id,training_id,cliente_id,instrutor_nome,status,qr_code_token,scheduled_at,started_at,finished_at,training:trainings(name),cliente:clientes(nome,razao_social)")
    .in("status", ["agendada", "em_andamento"])
    .order("scheduled_at", { ascending: true });

  if (error) return { error: error.message, data: [] as TurmaComDetalhes[] };

  const rows = (data ?? []) as unknown as (Turma & { training: { name: string } | null; cliente: { nome: string; razao_social: string | null } | null })[];
  const turmas: TurmaComDetalhes[] = rows.map((r) => ({
    ...r,
    trainingName: r.training?.name ?? "",
    clienteNome: r.cliente ? r.cliente.razao_social || r.cliente.nome : null,
  }));

  return { data: turmas };
}

/** Lista turmas concluídas, mais recente primeiro — pra aba "Concluídas" onde o instrutor gera o Relatório da Turma. */
export async function listarTurmasConcluidas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id,training_id,cliente_id,instrutor_nome,status,qr_code_token,scheduled_at,started_at,finished_at,training:trainings(name),cliente:clientes(nome,razao_social)")
    .eq("status", "concluida")
    .order("finished_at", { ascending: false });

  if (error) return { error: error.message, data: [] as TurmaComDetalhes[] };

  const rows = (data ?? []) as unknown as (Turma & { training: { name: string } | null; cliente: { nome: string; razao_social: string | null } | null })[];
  const turmas: TurmaComDetalhes[] = rows.map((r) => ({
    ...r,
    trainingName: r.training?.name ?? "",
    clienteNome: r.cliente ? r.cliente.razao_social || r.cliente.nome : null,
  }));

  return { data: turmas };
}

export interface NovaTurmaInput {
  trainingId: string;
  clienteId: string;
  instrutorNome: string;
  scheduledAt: string;
}

/** Cria uma nova turma (public.classes), vinculando curso + cliente. */
export async function criarTurma(input: NovaTurmaInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .insert({
      training_id: input.trainingId,
      cliente_id: input.clienteId || null,
      instrutor_nome: input.instrutorNome || null,
      scheduled_at: input.scheduledAt || null,
      status: "agendada",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/apresentacao");
  revalidatePath("/treinamentos/turmas");

  const planoEnsinoError = await gerarPlanoEnsinoDaTurma(input);
  if (!planoEnsinoError) revalidatePath("/plano-ensino");

  return { data, planoEnsinoError };
}

/**
 * Gera o Plano de Ensino desta turma a partir do template de ementa/objetivos/
 * metodologia/bibliografia já cadastrado no curso (ver migration
 * 012_trainings_template_ensino.sql) — não bloqueia a criação da turma se
 * falhar, só devolve o aviso separado pra UI mostrar.
 */
async function gerarPlanoEnsinoDaTurma(input: NovaTurmaInput): Promise<string | undefined> {
  const [cursoRes, conteudoRes] = await Promise.all([buscarCurso(input.trainingId), listarSubtemasDoCurso(input.trainingId)]);

  if ("error" in cursoRes) return `Turma criada, mas não consegui gerar o Plano de Ensino: ${cursoRes.error}`;
  const curso = cursoRes.data;

  let clienteNome: string | undefined;
  if (input.clienteId) {
    const clienteRes = await buscarCliente(input.clienteId);
    if (!("error" in clienteRes)) clienteNome = clienteRes.data.razao_social ?? clienteRes.data.nome;
  }
  const turmaPeriodo = [clienteNome, input.scheduledAt ? formatarDataDia(input.scheduledAt) : null].filter(Boolean).join(" - ");

  const state: PlanoEnsinoWizardState = {
    training_id: curso.id,
    training: { id: curso.id, name: curso.name, total_hours: curso.total_hours },
    turma_periodo: turmaPeriodo || undefined,
    instrutor_responsavel: input.instrutorNome || undefined,
    ementa: curso.ementa ?? undefined,
    objetivo_geral: curso.objetivo_geral ?? undefined,
    objetivos_especificos: curso.objetivos_especificos,
    metodologia: curso.metodologia ?? undefined,
    recursos_didaticos: curso.recursos_didaticos ?? undefined,
    criterios_avaliacao: curso.criterios_avaliacao ?? undefined,
    bibliografia_basica: curso.bibliografia_basica,
    bibliografia_complementar: curso.bibliografia_complementar,
    conteudo_programatico: conteudoRes.data,
    datas_dias: input.scheduledAt ? { 1: input.scheduledAt } : undefined,
  };

  const result = await salvarPlanoEnsino(state);
  if ("error" in result) return `Turma criada, mas não consegui gerar o Plano de Ensino: ${result.error}`;
  return undefined;
}

/** Busca a turma + curso + aulas do curso, pro cockpit vinculado a turma. */
export async function buscarTurmaParaCockpit(classId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select(
      "id,training_id,cliente_id,instrutor_nome,status,qr_code_token,scheduled_at,started_at,finished_at,training:trainings(id,name,description,total_hours),cliente:clientes(nome,razao_social)"
    )
    .eq("id", classId)
    .single();

  if (error) return { error: error.message };

  const row = data as unknown as Turma & {
    training: { id: string; name: string; description: string | null; total_hours: number } | null;
    cliente: { nome: string; razao_social: string | null } | null;
  };
  return {
    data: {
      turma: row as Turma,
      curso: row.training,
      clienteNome: row.cliente ? row.cliente.razao_social || row.cliente.nome : null,
    },
  };
}

/** Marca a turma como em andamento e grava o horário de início. */
export async function iniciarTurma(classId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("classes").update({ status: "em_andamento", started_at: new Date().toISOString() }).eq("id", classId);
  if (error) return { error: error.message };

  revalidatePath("/apresentacao");
  return { success: true };
}

/** Marca a turma como concluída e grava o horário de término. */
export async function finalizarTurma(classId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("classes").update({ status: "concluida", finished_at: new Date().toISOString() }).eq("id", classId);
  if (error) return { error: error.message };

  revalidatePath("/apresentacao");
  revalidatePath("/treinamentos/turmas");
  return { success: true };
}

/**
 * Monta os dados agregados do Relatório da Turma — presença, resultado da
 * Avaliação (quiz) e da Pesquisa de Satisfação, já prontos pro gerador de PDF
 * desenhar os gráficos. Sob demanda (não é disparado automaticamente ao
 * finalizar a turma) porque aluno responde a pesquisa pelo próprio celular e
 * pode continuar enviando depois que o instrutor encerra a aula.
 */
export async function buscarRelatorioTurma(classId: string): Promise<{ data: RelatorioTurmaData } | { error: string }> {
  const supabase = await createClient();

  const [turmaRes, presencasRes, avaliacaoRes, satisfacaoRes] = await Promise.all([
    supabase
      .from("classes")
      .select("instrutor_nome,scheduled_at,finished_at,training:trainings(name,total_hours),cliente:clientes(nome,razao_social)")
      .eq("id", classId)
      .single(),
    supabase.from("attendances").select("id", { count: "exact", head: true }).eq("class_id", classId),
    supabase.from("avaliacao_respostas").select("acertos,total").eq("class_id", classId),
    supabase.from("pesquisas_satisfacao").select("notas,comentario").eq("class_id", classId),
  ]);

  if (turmaRes.error) return { error: turmaRes.error.message };

  const turmaRow = turmaRes.data as unknown as {
    instrutor_nome: string | null;
    scheduled_at: string | null;
    finished_at: string | null;
    training: { name: string; total_hours: number } | null;
    cliente: { nome: string; razao_social: string | null } | null;
  };

  const totalPresentes = presencasRes.count ?? 0;

  const avaliacaoRows = (avaliacaoRes.data ?? []) as { acertos: number; total: number }[];
  const percentuais = avaliacaoRows.filter((r) => r.total > 0).map((r) => (r.acertos / r.total) * 100);
  const mediaAcertosPercent = percentuais.length > 0 ? percentuais.reduce((a, b) => a + b, 0) / percentuais.length : 0;

  const satisfacaoRows = (satisfacaoRes.data ?? []) as { notas: number[]; comentario: string | null }[];
  const perguntas = PERGUNTAS_PESQUISA_SATISFACAO.map((pergunta, i) => {
    const notas = satisfacaoRows.map((r) => r.notas?.[i]).filter((n): n is number => typeof n === "number");
    const distribuicao: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    notas.forEach((n) => {
      if (n >= 1 && n <= 5) distribuicao[Math.round(n) - 1]++;
    });
    const media = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;
    return { pergunta, media, distribuicao };
  });

  const todasNotas = perguntas.flatMap((p) => p.distribuicao.flatMap((qtd, idx) => Array(qtd).fill(idx + 1)));
  const mediaGeral = todasNotas.length > 0 ? todasNotas.reduce((a: number, b: number) => a + b, 0) / todasNotas.length : 0;
  const comentarios = satisfacaoRows.map((r) => r.comentario?.trim()).filter((c): c is string => !!c);

  const data: RelatorioTurmaData = {
    classId,
    identificacao: {
      trainingName: turmaRow.training?.name ?? "",
      totalHours: turmaRow.training?.total_hours ?? null,
      clienteNome: turmaRow.cliente ? turmaRow.cliente.razao_social || turmaRow.cliente.nome : null,
      instrutorNome: turmaRow.instrutor_nome,
      scheduledAt: turmaRow.scheduled_at,
      finishedAt: turmaRow.finished_at,
    },
    avaliacao: { totalRespostas: avaliacaoRows.length, totalPresentes, mediaAcertosPercent },
    satisfacao: { totalRespostas: satisfacaoRows.length, totalPresentes, mediaGeral, perguntas, comentarios },
  };

  return { data };
}

/** Lista as presenças já registradas na turma — usado pro contador ao vivo no cockpit. */
export async function listarPresencas(classId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendances")
    .select("id,checked_in_at,student:students(full_name,cpf)")
    .eq("class_id", classId)
    .order("checked_in_at", { ascending: false });

  if (error) return { error: error.message, data: [] as PresencaRegistrada[] };
  return { data: (data ?? []) as unknown as PresencaRegistrada[] };
}

// ── Fluxo público de check-in do aluno (sem autenticação no Hub) ──

/** Busca a turma pelo token do QR — usado pela página pública de check-in. */
export async function buscarTurmaPorToken(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id,status,scheduled_at,training:trainings(name,total_hours),cliente:clientes(nome,razao_social)")
    .eq("qr_code_token", token)
    .single();

  if (error) return { error: "Turma não encontrada. Verifique o QR Code com o instrutor." };
  return { data };
}

function limparCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/** Busca um aluno pelo CPF (usado pra saber se precisa de auto-cadastro no check-in). */
export async function buscarAlunoPorCpf(cpf: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("students").select("id,cpf,full_name,email,phone,cliente_id").eq("cpf", limparCpf(cpf)).maybeSingle();
  return { data: data as Student | null };
}

export interface AutoCadastroAlunoInput {
  cpf: string;
  fullName: string;
  email: string;
  phone: string;
  clienteId: string | null;
}

/** Cria o aluno no check-in quando o CPF ainda não está cadastrado. */
export async function autoCadastrarAluno(input: AutoCadastroAlunoInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .insert({
      cpf: limparCpf(input.cpf),
      full_name: input.fullName.trim(),
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
      cliente_id: input.clienteId,
    })
    .select("id,cpf,full_name,email,phone,cliente_id")
    .single();

  if (error) return { error: error.message };
  return { data: data as Student };
}

export interface RegistrarPresencaInput {
  classId: string;
  studentId: string;
  latitude: number | null;
  longitude: number | null;
}

/** Registra a presença do aluno na turma — tolera check-in duplicado (aluno escaneou de novo). */
export async function registrarPresenca(input: RegistrarPresencaInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("attendances").insert({
    class_id: input.classId,
    student_id: input.studentId,
    source: "qr_code",
    latitude: input.latitude,
    longitude: input.longitude,
  });

  if (error) {
    if (error.code === "23505") return { success: true, jaRegistrado: true };
    return { error: error.message };
  }

  return { success: true, jaRegistrado: false };
}
