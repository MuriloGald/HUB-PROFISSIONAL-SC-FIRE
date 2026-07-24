import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentProfile } from "@/lib/auth/roles";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();

  // Defesa extra além do middleware — sem perfil não entra no painel.
  if (!profile) redirect("/");

  return (
    <DashboardShell role={profile.role} email={profile.email} fullName={profile.full_name}>
      {children}
    </DashboardShell>
  );
}
