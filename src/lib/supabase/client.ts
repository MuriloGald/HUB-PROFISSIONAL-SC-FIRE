import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso em Client Components ("use client").
 * Usa cookies gerenciados pelo @supabase/ssr para manter a sessão
 * sincronizada entre cliente e servidor.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    // Retorna um stub vazio para não quebrar o build quando as env vars não estão configuradas
    // (ex: pré-renderização estática no Vercel antes de configurar as variáveis)
    const noop = () => Promise.resolve({ data: null, error: null });
    return {
      from: () => ({ select: noop, insert: noop, update: noop, delete: noop, upsert: noop, eq: () => ({ select: noop, single: noop, order: noop }) }),
      auth: { getUser: noop, signOut: noop },
      channel: () => ({ on: () => ({ subscribe: noop }), subscribe: noop }),
    } as any;
  }

  return createBrowserClient(url, key);
}
