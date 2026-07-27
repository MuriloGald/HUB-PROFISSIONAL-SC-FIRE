import Link from "next/link";
import { ScrollText, PlusCircle, ListChecks } from "lucide-react";
import { listarVistoriasManutencao } from "@/app/actions/in04";

export default async function In04DashboardPage() {
  const { data: laudos } = await listarVistoriasManutencao();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">IN 04 — Manutenção do SMSCI</h1>
        <p className="text-sm text-gray-400 mt-1">Vistoria de campo por pavimento e por sistema preventivo, com relatório em PDF na identidade visual SC Fire.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vistorias Emitidas</span>
            <div className="text-2xl font-bold text-white mt-1">{laudos.length}</div>
          </div>
          <ScrollText className="w-8 h-8 text-red-500/30" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/documentos/in04/novo"
          className="group relative flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center shadow-lg shadow-black/30 mb-4">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-display">Nova Vistoria de Manutenção</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Selecione o cliente, percorra os pavimentos e lance cada extintor, hidrante, saída etc. individualmente.</p>
        </Link>
        <Link
          href="/documentos/in04/lista"
          className="group relative flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-black/30 mb-4">
            <ListChecks className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-display">Consultar Vistorias ({laudos.length})</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Veja as vistorias já emitidas, baixe os PDFs ou edite os dados.</p>
        </Link>
      </section>
    </div>
  );
}
