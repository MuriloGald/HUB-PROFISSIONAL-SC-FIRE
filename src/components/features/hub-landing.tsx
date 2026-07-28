"use client";

import Link from "next/link";
import {
  Flame,
  TrendingUp,
  GraduationCap,
  FileText,
  Users,
  Building2,
  LogOut,
  Server,
  Plus,
  UserCog
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import type { CurrentProfile } from "@/lib/auth/roles";

interface HubLandingProps {
  stats: {
    clientes: number;
    condominios: number;
    laudos: number;
  };
  profile: CurrentProfile;
}

const ROLE_LABEL = { diretor: "Diretor", administrador: "Administrador", professor: "Professor" };

export function HubLanding({ stats, profile }: HubLandingProps) {
  const modules = [
    {
      title: "CRM & Vendas",
      description: "Gestão de leads, propostas B2B, funil comercial e as telas de Agente IA / WhatsApp integradas ao módulo.",
      icon: TrendingUp,
      href: "/crm",
      color: "from-blue-600 to-blue-400",
      status: "Operacional"
    },
    {
      title: "Área de Treinamentos",
      description: "Ambiente de treinamento, turmas em andamento, subtemas e cursos presenciais.",
      icon: GraduationCap,
      href: "/treinamentos",
      color: "from-green-600 to-emerald-400",
      status: "Operacional"
    },
    {
      title: "Gerador de Documentos",
      description: "Eventos (IN 24), Brigada (PIBI/PAE), Habite-se e Vistoria SAVE (IN 23) — cálculo e emissão de laudos.",
      icon: FileText,
      href: "/laudos",
      color: "from-purple-600 to-indigo-400",
      status: "Operacional"
    }
  ];

  const quickActions = [
    { label: "Novo cliente", href: "/clientes/novo", icon: Plus },
    { label: "Emitir laudo", href: "/laudos/eventos/novo", icon: Plus },
    { label: "Nova turma", href: "/treinamentos/turmas/nova", icon: Plus },
    ...(profile.role === "diretor"
      ? [{ label: "Gerenciar usuários", href: "/admin/usuarios", icon: UserCog }]
      : []),
  ];

  const displayName = profile.full_name || profile.email;
  const firstName = displayName.split(" ")[0] || displayName;
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";
  const roleLabel = ROLE_LABEL[profile.role];
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  return (
    <div className="min-h-dvh bg-background flex flex-col p-6 relative overflow-hidden text-foreground">
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between border-b border-border pb-4 mb-10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">SC FIRE</h1>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Central Operacional</span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Connection status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs">
            <Server className="w-3.5 h-3.5 text-success" />
            <span className="text-muted-foreground font-medium">Supabase</span>
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          </div>

          <ThemeToggle />

          {/* User profile & logout */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
              title={`${displayName} (${roleLabel})`}
            >
              {initial}
            </div>
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-foreground">{displayName}</div>
              <div className="text-[10px] text-muted-foreground">{roleLabel}</div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center z-10">

        {/* Welcome Section */}
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Bem-vindo de volta, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{firstName}</span>
          </h2>
          <span className="text-sm text-muted-foreground capitalize">{today}</span>
        </div>
        <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-2xl">
          Gerencie atendimentos, laudos técnicos, vistorias e treinamentos em uma plataforma única integrada.
        </p>

        {/* Database Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clientes B2B</span>
              <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{stats.clientes}</div>
            </div>
            <Users className="w-8 h-8 text-primary/30" />
          </div>

          <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Condomínios Cadastrados</span>
              <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{stats.condominios}</div>
            </div>
            <Building2 className="w-8 h-8 text-primary/30" />
          </div>

          <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Laudos & Projetos</span>
              <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{stats.laudos}</div>
            </div>
            <FileText className="w-8 h-8 text-primary/30" />
          </div>
        </section>

        {/* Modules Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {modules.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="group relative flex flex-col p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center shadow-lg shadow-black/30 transform group-hover:scale-110 transition-transform duration-300`}>
                  <mod.icon className="w-6 h-6 text-white" />
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider text-success uppercase bg-success/15 rounded-full">
                  {mod.status}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {mod.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                {mod.description}
              </p>

              {/* Arrow Indicator */}
              <div className="text-xs text-primary font-semibold flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                Acessar Módulo ↗
              </div>
            </Link>
          ))}
        </section>

        {/* Quick actions */}
        <section className="mb-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Acesso rápido</span>
          <div className="flex flex-wrap gap-2 mt-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-surface border border-border text-foreground hover:border-primary/40 hover:-translate-y-0.5 transition-all"
              >
                <action.icon className="w-3.5 h-3.5 text-primary" />
                {action.label}
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto border-t border-border pt-4 mt-8 flex justify-between items-center text-[10px] text-muted-foreground z-10">
        <span>© {new Date().getFullYear()} SC FIRE. Todos os direitos reservados.</span>
        <span>RT: Eng.ª Dione Borges</span>
      </footer>
    </div>
  );
}
