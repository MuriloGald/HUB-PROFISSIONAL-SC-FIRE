import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Bot,
  MessageCircle,
  KanbanSquare,
  User,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// Sidebar de 6 itens. Sem "Prospecção" e sem "Agenda".
const ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/configuracao", label: "Configuração", icon: Settings },
  { to: "/agente", label: "Agente IA", icon: Bot },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { to: "/crm", label: "CRM", icon: KanbanSquare },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
        <img src="/logo-sc-fire.png" alt="SC Fire" className="h-9 w-9 rounded-lg object-contain bg-white p-1" />
        <div className="leading-tight">
          <div className="font-display font-semibold">SC Fire CRM</div>
          <div className="text-xs text-sidebar-foreground/60">CRM + Agente IA · teste</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-white/10",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors mt-4 border-t border-white/10 pt-4",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-white/10",
              )
            }
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="px-5 py-4 text-xs text-sidebar-foreground/50 border-t border-white/10">
        v1.0 · local
      </div>
    </aside>
  );
}
