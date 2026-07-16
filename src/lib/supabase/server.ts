import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route Handlers.
 * Lê e escreve cookies via next/headers para manter a sessão no servidor.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase env vars não configuradas. Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nas variáveis de ambiente do Vercel."
    );
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component: cookies só podem ser escritos em Actions/Handlers
          }
        },
      },
    }
  );
}

/**
 * Cliente Supabase com service role — bypassa RLS completamente.
 * Use APENAS em Server Actions/Route Handlers para operações que precisam
 * ignorar RLS (ex: INSERT público sem sessão de usuário).
 * NUNCA use no cliente ou exporte a key.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada nas variáveis de ambiente do servidor."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
