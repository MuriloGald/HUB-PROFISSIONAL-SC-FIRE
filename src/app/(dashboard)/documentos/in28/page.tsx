import Link from "next/link";
import { ShieldCheck, FlameKindling, Users } from "lucide-react";
import { listarPibis, listarRelatoriosFormacao, listarRelatoriosPrestacao } from "@/app/actions/in28";

export default async function In28DashboardPage() {
  const [{ data: pibis }, { data: formacao }, { data: prestacao }] = await Promise.all([listarPibis(), listarRelatoriosFormacao(), listarRelatoriosPrestacao()]);

  const acoes = [
    {
      title: "PIBI — Plano de Implementação de Brigada",
      desc: "Anexo C — plano de implementação de brigada de incêndio.",
      icon: ShieldCheck,
      hrefNovo: "/documentos/in28/pibi/novo",
      hrefLista: "/documentos/in28/pibi",
      color: "from-red-600 to-orange-400",
      total: pibis.length,
    },
    {
      title: "Relatório — Empresas de Formação",
      desc: "Anexo E — relatório anual de empresas de formação de brigadistas.",
      icon: FlameKindling,
      hrefNovo: "/documentos/in28/formacao/novo",
      hrefLista: "/documentos/in28/formacao",
      color: "from-blue-600 to-blue-400",
      total: formacao.length,
    },
    {
      title: "Relatório — Empresas de Prestação de Serviço",
      desc: "Anexo F — relatório anual de empresas de prestação de serviço de brigadistas.",
      icon: Users,
      hrefNovo: "/documentos/in28/prestacao/novo",
      hrefLista: "/documentos/in28/prestacao",
      color: "from-purple-600 to-purple-400",
      total: prestacao.length,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">IN 28 — Brigada de Incêndio</h1>
        <p className="text-sm text-gray-400 mt-1">PIBI (Anexo C) e relatórios anuais de empresas de formação (Anexo E) e prestação de serviço (Anexo F) de brigadistas.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PIBIs Emitidos</span>
            <div className="text-2xl font-bold text-white mt-1">{pibis.length}</div>
          </div>
          <ShieldCheck className="w-8 h-8 text-red-500/30" />
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Relatórios de Formação</span>
            <div className="text-2xl font-bold text-white mt-1">{formacao.length}</div>
          </div>
          <FlameKindling className="w-8 h-8 text-blue-500/30" />
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Relatórios de Prestação</span>
            <div className="text-2xl font-bold text-white mt-1">{prestacao.length}</div>
          </div>
          <Users className="w-8 h-8 text-purple-500/30" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {acoes.map((a) => (
          <div key={a.title} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 flex flex-col">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${a.color} flex items-center justify-center shadow-lg shadow-black/30 mb-4`}>
              <a.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">{a.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1">{a.desc}</p>
            <div className="flex items-center gap-3">
              <Link href={a.hrefNovo} className="px-3 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg transition-all">
                Novo
              </Link>
              <Link href={a.hrefLista} className="px-3 py-2 border border-white/[0.08] hover:border-white/[0.2] text-white text-xs font-semibold rounded-lg transition-all">
                Consultar ({a.total})
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
