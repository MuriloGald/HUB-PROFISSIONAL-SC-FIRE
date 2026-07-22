import Link from "next/link";
import { FileSignature, ScrollText, HandCoins } from "lucide-react";
import { listarRecursos, listarRessarcimentos } from "@/app/actions/in02";

export default async function In02DashboardPage() {
  const [{ data: recursos }, { data: ressarcimentos }] = await Promise.all([listarRecursos(), listarRessarcimentos()]);

  const acoes = [
    {
      title: "Formulário de Recurso",
      desc: "Anexo J — recurso contra Auto de Infração do CBMSC.",
      icon: ScrollText,
      hrefNovo: "/documentos/in02/recurso/novo",
      hrefLista: "/documentos/in02/recurso",
      color: "from-red-600 to-orange-400",
      total: recursos.length,
    },
    {
      title: "Ressarcimento de Multa",
      desc: "Anexo K (pessoa física) / Anexo L (pessoa jurídica).",
      icon: HandCoins,
      hrefNovo: "/documentos/in02/ressarcimento/novo",
      hrefLista: "/documentos/in02/ressarcimento",
      color: "from-blue-600 to-blue-400",
      total: ressarcimentos.length,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">IN 02 — Recursos e Ressarcimento de Multas</h1>
        <p className="text-sm text-gray-400 mt-1">Formulários oficiais do CBMSC (cabeçalho institucional, sem identidade visual SC Fire).</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recursos Emitidos</span>
            <div className="text-2xl font-bold text-white mt-1">{recursos.length}</div>
          </div>
          <FileSignature className="w-8 h-8 text-red-500/30" />
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Requerimentos de Ressarcimento</span>
            <div className="text-2xl font-bold text-white mt-1">{ressarcimentos.length}</div>
          </div>
          <HandCoins className="w-8 h-8 text-blue-500/30" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
