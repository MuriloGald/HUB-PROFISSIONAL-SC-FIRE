"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Presentation,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Home,
  ShoppingCart,
  ShieldCheck,
  Building2,
  LibraryBig,
  BarChart2,
  Palette,
  NotebookPen,
  BookMarked,
  ScrollText,
  UserCog,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { BniModal } from "@/components/features/bni-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AppRole } from "@/lib/auth/roles";

type NavLink = { type?: "link"; label: string; href: string; icon: React.ElementType };
type NavSection = { type: "section"; label: string };
type NavGroup = { type: "group"; label: string; icon: React.ElementType; basePath: string; items: { label: string; href: string }[] };
type NavItem = NavLink | NavSection | NavGroup;

function getNavItems(role: AppRole): NavItem[] {
  if (role === "professor") {
    return [{ label: "Treinador", href: "/treinador", icon: BookMarked }];
  }

  const crmItems = [{ label: "Dashboard", href: "/crm" }];
  if (role === "diretor") {
    crmItems.push({ label: "Agente IA", href: "/crm/agente-ia" }, { label: "WhatsApp", href: "/crm/whatsapp" });
  }

  const items: NavItem[] = [
    { label: "HUB Principal", href: "/", icon: Home },
    { label: "AVA (Dashboard)", href: "/treinamentos", icon: LayoutDashboard },
    { label: "Turmas", href: "/treinamentos/turmas", icon: Users },
    { label: "Subtemas", href: "/treinamentos/subtemas", icon: BookOpen },
    { label: "Cursos", href: "/treinamentos/cursos", icon: GraduationCap },
    { label: "Apresentação", href: "/apresentacao", icon: Presentation },
    { label: "Comercial", href: "/comercial", icon: ShoppingCart },
    { type: "group", label: "CRM (Vendas)", icon: TrendingUp, basePath: "/crm", items: crmItems },

    { label: "Área de Estudos", href: "/estudos", icon: LibraryBig },
    { label: "Treinador", href: "/treinador", icon: BookMarked },

    { label: "Clientes", href: "/clientes", icon: Users },

    { type: "section", label: "Documentos Técnicos" },

    {
      type: "group",
      label: "Eventos (IN 24)",
      icon: FileText,
      basePath: "/laudos",
      items: [
        { label: "Dashboard", href: "/laudos" },
        { label: "Novo Evento", href: "/laudos/eventos/novo" },
        { label: "Consultar Eventos", href: "/laudos/eventos" },
      ],
    },
    {
      type: "group",
      label: "Brigada (IN 28)",
      icon: ShieldCheck,
      basePath: "/documentos/in28",
      items: [
        { label: "Dashboard", href: "/documentos/in28" },
        { label: "Novo PIBI", href: "/documentos/in28/pibi/novo" },
        { label: "Consultar PIBIs", href: "/documentos/in28/pibi" },
        { label: "Relatório Formação (Anexo E)", href: "/documentos/in28/formacao" },
        { label: "Relatório Prestação (Anexo F)", href: "/documentos/in28/prestacao" },
      ],
    },
    {
      type: "group",
      label: "Habite-se",
      icon: Building2,
      basePath: "/habitese",
      items: [
        { label: "Dashboard", href: "/habitese" },
        { label: "Novo Termo", href: "/habitese/novo" },
        { label: "Consultar Termos", href: "/habitese/termos" },
      ],
    },
    {
      type: "group",
      label: "Plano de Ensino",
      icon: NotebookPen,
      basePath: "/plano-ensino",
      items: [
        { label: "Dashboard", href: "/plano-ensino" },
        { label: "Novo Plano", href: "/plano-ensino/novo" },
        { label: "Consultar Planos", href: "/plano-ensino/lista" },
      ],
    },
    {
      type: "group",
      label: "Inspeção de Regularidade",
      icon: ShieldCheck,
      basePath: "/documentos/in04",
      items: [
        { label: "Dashboard", href: "/documentos/in04" },
        { label: "Nova Vistoria", href: "/documentos/in04/novo" },
        { label: "Consultar Vistorias", href: "/documentos/in04/lista" },
        { label: "Laudos Técnicos (Dashboard)", href: "/documentos/laudos-tecnicos" },
        { label: "Novo Laudo Técnico", href: "/documentos/laudos-tecnicos/novo" },
        { label: "Consultar Laudos Técnicos", href: "/documentos/laudos-tecnicos/lista" },
      ],
    },
    {
      type: "group",
      label: "Preenchíveis CBMSC",
      icon: ScrollText,
      basePath: "/documentos",
      items: [
        { label: "IN 02 — Recursos e Multas", href: "/documentos/in02" },
        { label: "IN 07 — Hidrantes (SHP)", href: "/documentos/in07" },
        { label: "IN 09 — Elevador de Emergência", href: "/documentos/in09" },
        { label: "IN 10 — Controle de Fumaça", href: "/documentos/in10" },
        { label: "IN 15 — Chuveiros Automáticos", href: "/documentos/in15" },
        { label: "IN 27 — Eventos Pirotécnicos", href: "/documentos/in27" },
      ],
    },
    {
      type: "group",
      label: "Orçamentos",
      icon: FileText,
      basePath: "/orcamentos",
      items: [
        { label: "Anexo B - Parceria", href: "/orcamentos/anexo-b" },
      ],
    },
    {
      type: "group",
      label: "Relatórios",
      icon: BarChart2,
      basePath: "/relatorios",
      items: [
        { label: "SAVE — IN 23 (Dashboard)", href: "/relatorios/save-in23" },
        { label: "Vistorias de Campo", href: "/relatorios/save-in23/vistorias" },
        { label: "Laudos Técnicos", href: "/relatorios/save-in23/laudos" },
        { label: "Acompanhamento de Processos", href: "/relatorios/save-in23/processos" },
      ],
    },

    { label: "Identidade Visual", href: "/identidade-visual", icon: Palette },
    { label: "Configurações", href: "/configuracoes", icon: Settings },
  ];

  if (role === "diretor") {
    items.push({ label: "Usuários", href: "/admin/usuarios", icon: UserCog });
  }

  return items;
}

function NavGroupItem({
  item,
  pathname,
  collapsed,
  onClose,
}: {
  item: NavGroup;
  pathname: string | null;
  collapsed: boolean;
  onClose: () => void;
}) {
  const isGroupActive = pathname?.startsWith(item.basePath) ?? false;
  const [open, setOpen] = useState(isGroupActive);
  const Icon = item.icon;

  if (collapsed) {
    return (
      <Link
        href={item.basePath}
        title={item.label}
        className={`flex items-center justify-center px-2 py-2.5 rounded-lg transition-all duration-200 ${
          isGroupActive
            ? "bg-red-500/10 text-red-500"
            : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isGroupActive ? "text-red-500" : "text-muted-foreground"}`} />
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
          isGroupActive
            ? "bg-red-500/10 text-red-400 font-semibold"
            : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isGroupActive ? "text-red-500" : "text-muted-foreground"}`} />
        <span className="text-sm flex-1 text-left whitespace-nowrap">{item.label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""} ${
            isGroupActive ? "text-red-400" : "text-muted-foreground"
          }`}
        />
      </button>

      {open && (
        <div className="ml-8 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
          {item.items.map((sub) => {
            const isSubActive = pathname === sub.href;
            return (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={onClose}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-200 ${
                  isSubActive
                    ? "text-red-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isSubActive && <div className="w-1 h-1 rounded-full bg-red-500" />}
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardShell({
  role,
  email,
  fullName,
  children,
}: {
  role: AppRole;
  email: string;
  fullName: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isBniOpen, setIsBniOpen] = useState(false);
  const navItems = getNavItems(role);
  const displayName = fullName || email;
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";
  const roleLabel = { diretor: "Diretor", administrador: "Administrador", professor: "Professor" }[role];

  return (
    <>
      <div className="flex h-dvh overflow-hidden bg-background">
        {/* ── Mobile Overlay ── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed lg:relative z-50 flex flex-col h-dvh
            bg-sidebar-bg border-r border-sidebar-border
            transition-all duration-300 ease-in-out
            ${collapsed ? "lg:w-[72px]" : "lg:w-[260px]"}
            ${mobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Logo */}
          <div
            className={`flex items-center gap-3 px-5 h-16 border-b border-sidebar-border flex-shrink-0 ${collapsed ? "justify-center" : ""}`}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in overflow-hidden">
                <h2 className="text-sm font-bold text-foreground whitespace-nowrap">SC FIRE</h2>
                <p className="text-[11px] text-muted-foreground whitespace-nowrap">Sistema Operacional</p>
              </div>
            )}
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
            {navItems.map((item, idx) => {
              if (item.type === "section") {
                if (collapsed) return null;
                return (
                  <div key={idx} className="pt-4 pb-1 px-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                );
              }

              if (item.type === "group") {
                return (
                  <NavGroupItem
                    key={item.basePath}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                    onClose={() => setMobileOpen(false)}
                  />
                );
              }

              const isActive =
                pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    group flex items-center gap-3 rounded-lg transition-all duration-200
                    ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
                    ${
                      isActive
                        ? "bg-red-500/10 text-red-500 font-semibold"
                        : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                    }
                  `}
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-red-500" : "text-muted-foreground group-hover:text-foreground"}`}
                  />
                  {!collapsed && (
                    <span className="text-sm whitespace-nowrap">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </Link>
              );
            })}

            {/* BNI */}
            {role !== "professor" && (
              <button
                onClick={() => { setIsBniOpen(true); setMobileOpen(false); }}
                title={collapsed ? "Módulo BNI" : undefined}
                className={`
                  w-full group flex items-center gap-3 rounded-lg transition-all duration-200 mt-1
                  ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
                  text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground
                `}
              >
                <Presentation className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
                {!collapsed && <span className="text-sm whitespace-nowrap">Módulo BNI</span>}
              </button>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-3 flex-shrink-0 space-y-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-full h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-all duration-200"
              title={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Recolher</span>
                </div>
              )}
            </button>

            <form action={logout}>
              <button
                type="submit"
                title={collapsed ? "Sair" : undefined}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${collapsed ? "justify-center px-2" : ""}`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">Sair</span>}
              </button>
            </form>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <header className="flex items-center h-16 px-4 lg:px-6 border-b border-border bg-sidebar-bg/50 backdrop-blur-md flex-shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden mr-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <Flame className="w-4 h-4 text-red-500 lg:hidden" />
              <span className="text-muted-foreground font-medium">SC FIRE Hub</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <ThemeToggle />
              <span className="hidden sm:block text-xs text-muted-foreground" title={email}>
                {displayName} <span className="text-muted-foreground/70">· {roleLabel}</span>
              </span>
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm"
                title={`${displayName} (${roleLabel})`}
              >
                {initial}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>

      <BniModal isOpen={isBniOpen} onClose={() => setIsBniOpen(false)} />
    </>
  );
}
