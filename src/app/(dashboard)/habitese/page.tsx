import Link from "next/link";
import { UserPlus, Search, FileSignature, Users, ClipboardList, PieChart } from "lucide-react";
import { listarClientesImovel, listarTermosHabitese } from "@/app/actions/habitese";
import type { HabiteseWizardState } from "@/lib/habitese/types";

export default async function HabiteseDashboardPage() {
  const [{ data: clientes }, { data: termos }] = await Promise.all([listarClientesImovel(), listarTermosHabitese()]);

  const porRisco = termos.reduce(
    (acc, l) => {
      const risco = (l.dados as HabiteseWizardState).risco;
      if (risco) acc[risco] += 1;
      return acc;
    },
    { II: 0, III: 0, IV: 0, V: 0 }
  );

  const acoes = [
    {
      title: "Cadastrar Proprietário",
      desc: "Adicione um novo responsável pelo imóvel à base.",
      icon: UserPlus,
      href: "/habitese/responsaveis/novo",
      color: "from-blue-600 to-blue-400",
    },
    {
      title: "Consultar Proprietários",
      desc: "Busque, edite ou inicie um termo a partir de um proprietário existente.",
      icon: Search,
      href: "/habitese/responsaveis",
      color: "from-amber-600 to-yellow-400",
    },
    {
      title: "Novo Termo",
      desc: "Inicie o fluxo de emissão do Termo de Entrega do Imóvel.",
      icon: ClipboardList,
      href: "/habitese/novo",
      color: "from-emerald-600 to-emerald-400",
    },
    {
      title: "Consultar Termos",
      desc: "Veja os últimos termos emitidos, gere os PDFs novamente ou exclua registros.",
      icon: FileSignature,
      href: "/habitese/termos",
      color: "from-red-600 to-orange-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Habite-se — Termo de Entrega do Imóvel</h1>
        <p className="text-sm text-gray-400 mt-1">Emissão do Termo de Entrega do Imóvel para solicitação do Habite-se junto ao CBMSC.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Proprietários Cadastrados</span>
            <div className="text-2xl font-bold text-white mt-1">{clientes.length}</div>
          </div>
          <Users className="w-8 h-8 text-blue-500/30" />
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Termos Emitidos</span>
            <div className="text-2xl font-bold text-white mt-1">{termos.length}</div>
          </div>
          <FileSignature className="w-8 h-8 text-red-500/30" />
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Termos por Risco</span>
            <div className="text-sm font-bold text-white mt-1">
              II: {porRisco.II} <span className="text-gray-600">|</span> III: {porRisco.III} <span className="text-gray-600">|</span> IV: {porRisco.IV}{" "}
              <span className="text-gray-600">|</span> V: {porRisco.V}
            </div>
          </div>
          <PieChart className="w-8 h-8 text-amber-500/30" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {acoes.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="group relative flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${a.color} flex items-center justify-center shadow-lg shadow-black/30 mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
              <a.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors font-display">{a.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{a.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
