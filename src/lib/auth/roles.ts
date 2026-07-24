import { createClient } from "@/lib/supabase/server";

export type AppRole = "diretor" | "administrador" | "professor";

export interface CurrentProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
}

/** Usuário logado + papel, ou null se não autenticado. Uso em Server Components/Actions. */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return profile as CurrentProfile;
}

/**
 * Guard pra Server Actions: garante que o usuário logado tem um dos papéis permitidos.
 * Retorna o perfil em caso de sucesso, ou `{ error }` pra a action devolver direto.
 */
export async function requireRole(
  allowed: AppRole[]
): Promise<{ profile: CurrentProfile; error?: undefined } | { profile?: undefined; error: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Não autenticado." };
  if (!allowed.includes(profile.role)) {
    return { error: "Você não tem permissão para esta ação." };
  }
  return { profile };
}
