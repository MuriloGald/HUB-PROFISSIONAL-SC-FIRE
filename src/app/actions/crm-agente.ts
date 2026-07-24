"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import type { SdrConfig } from "@/lib/crm/types";

/** Lê a configuração (única, por organização) do agente SDR. */
export async function getSdrConfig() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sdr_configs").select("*").limit(1).single();
  if (error) return { error: error.message, data: null };
  return { data: data as SdrConfig };
}

export interface SdrConfigInput {
  agent_name: string;
  company_context: string;
  products: string;
  qualification_criteria: string;
  communication_style: string;
  handoff_rules: string;
  enabled: boolean;
}

/** Salva a configuração do agente — só o diretor configura o agente. */
export async function saveSdrConfig(id: string, input: SdrConfigInput) {
  const guard = await requireRole(["diretor"]);
  if (guard.error) return { error: guard.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("sdr_configs")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/crm/agente-ia");
  return { success: true };
}
