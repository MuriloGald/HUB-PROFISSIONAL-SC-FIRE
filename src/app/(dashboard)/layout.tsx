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
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { BniModal } from "@/components/features/bni-modal";

type NavLink = { type?: "link"; label: string; href: string; icon: React.ElementType };
type NavSection = { type: "section"; label: string };
type NavGroup = { type: "group"; label: string; icon: React.ElementType; basePath: string; items: { label: string; href: string }[] };
type NavItem = NavLink | NavSection | NavGroup;

const navItems: NavItem[] = [
  { label: "HUB Principal", href: "/", icon: Home },
  { label: "AVA (Dashboard)", href: "/treinamentos", icon: LayoutDashboard },
  { label: "Turmas", href: "/treinamentos/turmas", icon: Users },
  { label: "Subtemas", href: "/treinamentos/subtemas", icon: BookOpen },
  { label: "Cursos", href: "/treinamentos/cursos", icon: GraduationCap },
  { label: "Apresentação", href: "/apresentacao", icon: Presentation },
  { label: "Comercial", href: "/comercial", icon: ShoppingCart },
  { label: "CRM (Vendas)", href: "/crm", icon: TrendingUp },

  { label: "Área de Estudos", href: "/estudos", icon: LibraryBig },

  { type: "section", label: "Documentos Técnicos" },

  {
    type: "group",
    label: "Eventos (IN 24)",
    icon: FileText,
    basePath: "/laudos",
    items: [
      { label: "Dashboard", href: "/laudos" },
      { label: "Clientes", href: "/laudos/clientes" },
      { label: "Novo Evento", href: "/laudos/eventos/novo" },
      { label: "Consultar Eventos", href: "/laudos/eventos" },
    ],
  },
  {
    type: "group",
    label: "Brigada (PIBI/PAE)",
    icon: ShieldCheck,
    basePath: "/brigada",
    items: [
      { label: "Dashboard", href: "/brigada" },
      { label: "Responsáveis", href: "/brigada/responsaveis" },
      { label: "Novo Documento", href: "/brigada/novo" },
    ],
  },
  {
    type: "group",
    label: "Habite-se",
    icon: Building2,
    basePath: "/habitese",
    items: [
      { label: "Dashboard", href: "/habitese" },
      { label: "Proprietários", href: "/habitese/responsaveis" },
      { label: "Nova Vistoria", href: "/habitese/novo" },
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
      { label: "SAVE — IN 23", href: "/relatorios/save-in23" },
    ],
  },

  { label: "Identidade Visual", href: "/identidade-visual", icon: Palette },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

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
            : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isGroupActive ? "text-red-500" : "text-gray-500"}`} />
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
            : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isGroupActive ? "text-red-500" : "text-gray-500"}`} />
        <span className="text-sm flex-1 text-left whitespace-nowrap">{item.label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""} ${
            isGroupActive ? "text-red-400" : "text-gray-600"
          }`}
        />
      </button>

      {open && (
        <div className="ml-8 mt-0.5 space-y-0.5 border-l border-white/[0.06] pl-3">
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
                    : "text-gray-500 hover:text-white"
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

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isBniOpen, setIsBniOpen] = useState(false);

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
            bg-[#050505] border-r border-white/[0.08]
            transition-all duration-300 ease-in-out
            ${collapsed ? "lg:w-[72px]" : "lg:w-[260px]"}
            ${mobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Logo */}
          <div
            className={`flex items-center gap-3 px-5 h-16 border-b border-white/[0.08] flex-shrink-0 ${collapsed ? "justify-center" : ""}`}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in overflow-hidden">
                <h2 className="text-sm font-bold text-white whitespace-nowrap">SC FIRE</h2>
                <p className="text-[11px] text-gray-400 whitespace-nowrap">Sistema Operacional</p>
              </div>
            )}
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto lg:hidden text-gray-400 hover:text-white"
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
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
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
                        : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                    }
                  `}
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-red-500" : "text-gray-500 group-hover:text-white"}`}
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
            <button
              onClick={() => { setIsBniOpen(true); setMobileOpen(false); }}
              title={collapsed ? "Módulo BNI" : undefined}
              className={`
                w-full group flex items-center gap-3 rounded-lg transition-all duration-200 mt-1
                ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
                text-gray-400 hover:bg-white/[0.04] hover:text-white
              `}
            >
              <Presentation className="w-5 h-5 flex-shrink-0 text-gray-500 group-hover:text-white" />
              {!collapsed && <span className="text-sm whitespace-nowrap">Módulo BNI</span>}
            </button>
          </nav>

          {/* Footer */}
          <div className="border-t border-white/[0.08] p-3 flex-shrink-0 space-y-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-full h-9 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
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
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${collapsed ? "justify-center px-2" : ""}`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">Sair</span>}
              </button>
            </form>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
          <header className="flex items-center h-16 px-4 lg:px-6 border-b border-white/[0.08] bg-[#050505]/50 backdrop-blur-md flex-shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden mr-3 text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <Flame className="w-4 h-4 text-red-500 lg:hidden" />
              <span className="text-gray-400 font-medium">SC FIRE Hub</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                M
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
