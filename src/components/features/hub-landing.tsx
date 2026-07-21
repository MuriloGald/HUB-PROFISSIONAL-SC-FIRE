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
  Server
} from "lucide-react";
import { logout } from "@/app/actions/auth";

interface HubLandingProps {
  stats: {
    clientes: number;
    condominios: number;
    laudos: number;
  };
  userEmail: string | null;
}

export function HubLanding({ stats, userEmail }: HubLandingProps) {
  const modules = [
    {
      title: "CRM & Vendas",
      description: "Gestão de leads, propostas B2B, funil comercial e propostas financeiras.",
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

  return (
    <div className="min-h-dvh bg-[#070913] flex flex-col p-6 relative overflow-hidden text-gray-300 font-sans">
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between border-b border-white/[0.08] pb-4 mb-10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-display">SC FIRE</h1>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Central Operacional</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Connection status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-xs">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-400 font-medium">Supabase</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* User profile & logout */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-white">{userEmail || "Operador"}</div>
              <div className="text-[10px] text-gray-500">Acesso Administrativo</div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
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
        <div className="text-center md:text-left mb-8 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 font-display">HUB SC FIRE</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">
            Gerencie atendimentos, laudos técnicos, vistorias e treinamentos em uma plataforma única integrada.
          </p>
        </div>

        {/* Database Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Clientes B2B</span>
              <div className="text-2xl font-bold text-white mt-1">{stats.clientes}</div>
            </div>
            <Users className="w-8 h-8 text-blue-500/30" />
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Condomínios Cadastrados</span>
              <div className="text-2xl font-bold text-white mt-1">{stats.condominios}</div>
            </div>
            <Building2 className="w-8 h-8 text-green-500/30" />
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Laudos & Projetos</span>
              <div className="text-2xl font-bold text-white mt-1">{stats.laudos}</div>
            </div>
            <FileText className="w-8 h-8 text-purple-500/30" />
          </div>
        </section>

        {/* Modules Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {modules.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="group relative flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden"
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center shadow-lg shadow-black/30 transform group-hover:scale-110 transition-transform duration-300`}>
                  <mod.icon className="w-6 h-6 text-white" />
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider text-gray-500 uppercase bg-white/[0.03] border border-white/[0.05] rounded-full">
                  {mod.status}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors font-display">
                {mod.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1">
                {mod.description}
              </p>

              {/* Arrow Indicator */}
              <div className="text-xs text-red-500 font-semibold flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                Acessar Módulo ↗
              </div>
            </Link>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto border-t border-white/[0.05] pt-4 mt-8 flex justify-between items-center text-[10px] text-gray-600 z-10">
        <span>© 2026 SC FIRE. Todos os direitos reservados.</span>
        <span>RT: Eng.ª Dione Borges</span>
      </footer>
    </div>
  );
}

