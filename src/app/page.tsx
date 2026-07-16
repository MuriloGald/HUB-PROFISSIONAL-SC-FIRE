import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/features/login-form";
import { HubLanding } from "@/components/features/hub-landing";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <LoginForm />;
  }

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

  return <HubLanding stats={stats} userEmail={user.email ?? null} />;
}
