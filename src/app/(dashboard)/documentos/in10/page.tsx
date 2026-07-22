import Link from "next/link";
import { Wind, PlusCircle, ListChecks } from "lucide-react";
import { listarControlesFumaca } from "@/app/actions/in10";

export default async function In10DashboardPage() {
  const { data: laudos } = await listarControlesFumaca();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">IN 10 — Sistema de Controle de Fumaça</h1>
        <p className="text-sm text-gray-400 mt-1">Anexo B (Comissionamento) e Anexo C (Inspeção), cabeçalho oficial do CBMSC.</p>
      </div>

      <section className="grid grid-cols-1 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Relatórios Emitidos</span>
            <div className="text-2xl font-bold text-white mt-1">{laudos.length}</div>
          </div>
          <Wind className="w-8 h-8 text-blue-500/30" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/documentos/in10/novo"
          className="group relative flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center shadow-lg shadow-black/30 mb-4">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-display">Novo Relatório</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Escolha Comissionamento (Anexo B) ou Inspeção Periódica (Anexo C) e gere o PDF oficial.</p>
        </Link>
        <Link
          href="/documentos/in10/lista"
          className="group relative flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-black/30 mb-4">
            <ListChecks className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-display">Consultar Relatórios ({laudos.length})</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Veja os relatórios já emitidos, baixe os PDFs ou edite os dados.</p>
        </Link>
      </section>
    </div>
  );
}
