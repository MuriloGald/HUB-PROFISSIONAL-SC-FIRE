import Link from "next/link";
import { PlusCircle, Search, NotebookPen, GraduationCap } from "lucide-react";
import { listarPlanosEnsino } from "@/app/actions/plano-ensino";
import type { PlanoEnsinoWizardState } from "@/lib/plano-ensino/types";

export default async function PlanoEnsinoDashboardPage() {
  const { data: planos } = await listarPlanosEnsino();

  const cursosDistintos = new Set(planos.map((p) => (p.dados as PlanoEnsinoWizardState).training_id).filter(Boolean)).size;

  const acoes = [
    {
      title: "Novo Plano de Ensino",
      desc: "Selecione um curso já cadastrado e gere o Programa de Matéria.",
      icon: PlusCircle,
      href: "/plano-ensino/novo",
      color: "from-emerald-600 to-emerald-400",
    },
    {
      title: "Consultar Planos",
      desc: "Veja os planos já gerados, baixe os PDFs ou exclua registros.",
      icon: Search,
      href: "/plano-ensino/lista",
      color: "from-red-600 to-orange-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Plano de Ensino — Programa de Matéria</h1>
        <p className="text-sm text-gray-400 mt-1">Geração do plano de ensino de cada curso, seguindo a identidade visual da SC Fire.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Planos Emitidos</span>
            <div className="text-2xl font-bold text-white mt-1">{planos.length}</div>
          </div>
          <NotebookPen className="w-8 h-8 text-red-500/30" />
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cursos Cobertos</span>
            <div className="text-2xl font-bold text-white mt-1">{cursosDistintos}</div>
          </div>
          <GraduationCap className="w-8 h-8 text-blue-500/30" />
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
