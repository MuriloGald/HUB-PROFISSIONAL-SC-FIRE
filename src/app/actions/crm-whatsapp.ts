"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/roles";
import type { WhatsappInstance } from "@/lib/crm/types";

/** Lista as instâncias de WhatsApp cadastradas. */
export async function listInstances() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whatsapp_instances")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] as WhatsappInstance[] };
  return { data: (data ?? []) as WhatsappInstance[] };
}

/** Cadastra uma nova instância — só o diretor configura o WhatsApp. */
export async function createInstance(name: string) {
  const guard = await requireRole(["diretor"]);
  if (guard.error) return { error: guard.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whatsapp_instances")
    .insert({ name: name.trim(), status: "disconnected" })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/crm/whatsapp");
  return { data: data as WhatsappInstance };
}

/**
 * Marca a instância como conectada. Stub por enquanto: só atualiza o status,
 * sem QR code ou webhook reais — a integração com a API da UaiZapi fica pra
 * uma próxima etapa (precisa de Edge Function + secrets de produção).
 */
export async function connectInstance(id: string) {
  const guard = await requireRole(["diretor"]);
  if (guard.error) return { error: guard.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whatsapp_instances")
    .update({ status: "connected" })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/crm/whatsapp");
  return { data: data as WhatsappInstance };
}
