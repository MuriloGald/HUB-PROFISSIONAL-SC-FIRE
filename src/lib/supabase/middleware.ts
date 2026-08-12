import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { AppRole } from "@/lib/auth/roles";

/**
 * Rotas do painel que exigem usuário autenticado. Tudo que não estiver
 * nesta lista (ex: /, /aluno/*, /auth/*) permanece público.
 */
const PROTECTED_SEGMENTS = [
  "/admin",
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
  "/profissionais",
  "/relatorios",
  "/treinador",
  "/treinamentos",
];

/** Prefixos do CRM que só o diretor configura (agente IA, WhatsApp). */
const CRM_DIRETOR_ONLY = ["/crm/agente-ia", "/crm/whatsapp"];

/**
 * Middleware de autenticação SC FIRE.
 *
 * Responsabilidades:
 * 1. Atualiza/renova o token de sessão do Supabase a cada request.
 * 2. Protege as rotas do painel — redireciona para / se não autenticado.
 *    A própria rota / decide o que renderizar (login ou cards do Hub).
 * 3. Aplica os limites de acesso por papel (diretor/administrador/professor).
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
  const isProtected = PROTECTED_SEGMENTS.some((seg) => pathname.startsWith(seg));

  // Rota protegida sem usuário → login
  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    return NextResponse.redirect(loginUrl);
  }

  if (user && (isProtected || pathname === "/")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = (profile?.role ?? "professor") as AppRole;

    // Professor não tem página inicial no Hub — vai direto pro Treinador.
    if (role === "professor" && pathname === "/") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/treinador";
      return NextResponse.redirect(redirectUrl);
    }

    if (role === "professor" && isProtected && !pathname.startsWith("/treinador")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/treinador";
      return NextResponse.redirect(redirectUrl);
    }

    if (role === "administrador") {
      if (pathname.startsWith("/admin")) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/";
        return NextResponse.redirect(redirectUrl);
      }
      if (CRM_DIRETOR_ONLY.some((seg) => pathname.startsWith(seg))) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/crm";
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return supabaseResponse;
}
