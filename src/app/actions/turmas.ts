"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PresencaRegistrada, Student, Turma, TurmaComDetalhes } from "@/lib/turmas/types";

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
  return { data };
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
