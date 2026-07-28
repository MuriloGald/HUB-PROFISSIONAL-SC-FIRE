import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/features/login-form";
import { HubLanding } from "@/components/features/hub-landing";
import { getCurrentProfile } from "@/lib/auth/roles";

export default async function RootPage() {
  // getCurrentProfile já cobre "sem usuário" e "sem perfil" (defesa extra,
  // igual ao (dashboard)/layout.tsx). Professor nunca chega aqui — o
  // middleware já redireciona pra /treinador antes de renderizar.
  const profile = await getCurrentProfile();

  if (!profile) {
    return <LoginForm />;
  }

  const supabase = await createClient();

  // Fetch statistics in parallel with error fallbacks
  const [clientesRes, condominiosRes, laudosRes] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("clientes").select("*", { count: "exact", head: true }).eq("tipo", "condominio"),
    supabase.from("laudos").select("*", { count: "exact", head: true }),
  ]);

  const stats = {
    clientes: clientesRes.count || 0,
    condominios: condominiosRes.count || 0,
    laudos: laudosRes.count || 0,
  };

  return <HubLanding stats={stats} profile={profile} />;
}
