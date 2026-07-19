import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rotas do painel que exigem usuário autenticado. Tudo que não estiver
 * nesta lista (ex: /, /aluno/*, /auth/*) permanece público.
 */
const PROTECTED_SEGMENTS = [
  "/instrutor",
  "/apresentacao",
  "/brigada",
  "/clientes",
  "/comercial",
  "/configuracoes",
  "/crm",
  "/estudos",
  "/habitese",
  "/laudos",
  "/orcamentos",
  "/plano-ensino",
  "/relatorios",
  "/treinamentos",
];

/**
 * Middleware de autenticação SC FIRE.
 *
 * Responsabilidades:
 * 1. Atualiza/renova o token de sessão do Supabase a cada request.
 * 2. Protege as rotas do painel — redireciona para / se não autenticado.
 *    A própria rota / decide o que renderizar (login ou cards do Hub).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Busca o usuário atual (não usa getSession() — seguro contra spoofing)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rota protegida sem usuário → login
  const isProtected = PROTECTED_SEGMENTS.some((seg) => pathname.startsWith(seg));
  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
