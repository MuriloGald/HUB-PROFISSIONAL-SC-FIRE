"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requireRole, type AppRole } from "@/lib/auth/roles";

export interface Usuario {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
}

/** Lista todos os perfis — só o diretor gerencia usuários. */
export async function listarUsuarios() {
  const guard = await requireRole(["diretor"]);
  if (guard.error) return { error: guard.error, data: [] as Usuario[] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: true });

  if (error) return { error: error.message, data: [] as Usuario[] };
  return { data: (data ?? []) as Usuario[] };
}

export interface NovoUsuarioInput {
  email: string;
  fullName: string;
  role: AppRole;
  senhaProvisoria: string;
}

/** Cria a conta no Supabase Auth (via service role) e define o papel escolhido. */
export async function criarUsuario(input: NovoUsuarioInput) {
  const guard = await requireRole(["diretor"]);
  if (guard.error) return { error: guard.error };

  if (input.senhaProvisoria.length < 6) {
    return { error: "A senha provisória precisa ter no mínimo 6 caracteres." };
  }

  const admin = createServiceClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: input.email.trim(),
    password: input.senhaProvisoria,
    email_confirm: true,
    user_metadata: { full_name: input.fullName.trim() },
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Não foi possível criar a conta." };
  }

  // A linha em profiles já nasce via trigger (role 'professor' por padrão) — aqui
  // ajustamos pro papel escolhido na tela.
  const { data: profile, error: roleError } = await admin
    .from("profiles")
    .update({ role: input.role, full_name: input.fullName.trim() })
    .eq("id", created.user.id)
    .select("id, email, full_name, role, created_at")
    .single();

  if (roleError) return { error: roleError.message };

  revalidatePath("/admin/usuarios");
  return { data: profile as Usuario };
}

/** Troca o papel de uma conta já existente. */
export async function atualizarPapelUsuario(userId: string, role: AppRole) {
  const guard = await requireRole(["diretor"]);
  if (guard.error) return { error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/usuarios");
  return { success: true };
}

/** Remove a conta por completo (Auth + perfil, via cascade). */
export async function excluirUsuario(userId: string) {
  const guard = await requireRole(["diretor"]);
  if (guard.error || !guard.profile) return { error: guard.error ?? "Não autenticado." };

  if (guard.profile.id === userId) {
    return { error: "Você não pode excluir a própria conta." };
  }

  const admin = createServiceClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/usuarios");
  return { success: true };
}
