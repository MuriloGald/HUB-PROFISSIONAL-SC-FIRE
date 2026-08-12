"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Download, Trash2, ClipboardList, Pencil } from "lucide-react";
import { excluirVistoria } from "@/app/actions/save-in23";
import { avaliarSetor } from "@/lib/save-in23/classificador";
import type { Laudo } from "@/lib/supabase/types";
import type { VistoriaWizardState } from "@/lib/save-in23/types";

export function VistoriasList({ laudos }: { laudos: Laudo[] }) {
  const router = useRouter();
  const [termo, setTermo] = useState("");

  const filtrados = useMemo(() => {
    const t = termo.toLowerCase();
    return laudos.filter((l) => {
      const dados = l.dados as unknown as VistoriaWizardState;
      return dados.cliente?.razao_social?.toLowerCase().includes(t) || dados.codigo?.toLowerCase().includes(t);
    });
  }, [laudos, termo]);

  async function handleExcluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta vistoria? Essa ação não pode ser desfeita.")) return;
    await excluirVistoria(id);
    router.refresh();
  }

  async function handleBaixar(dados: VistoriaWizardState) {
    const { gerarPdfVistoria } = await import("@/lib/save-in23/pdf-generator");
    await gerarPdfVistoria(dados);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Vistorias de Campo — SAVE 23</h1>
          <p className="text-sm text-gray-400 mt-1">Histórico de vistorias já realizadas (Art. 6º, IN 23/CBMSC).</p>
        </div>
        <button
          onClick={() => router.push("/relatorios/save-in23/vistorias/nova")}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Vistoria
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por código (V-2026-001) ou nome da edificação..."
          className="w-full pl-10 pr-3 py-2.5 text-sm text-white bg-white/[0.02] border border-white/[0.08] rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        />
      </div>

      <div className="grid gap-3">
        {filtrados.length === 0 && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center py-12">
            <ClipboardList className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-gray-400 font-semibold">Nenhuma vistoria registrada ainda</h3>
            <p className="text-xs text-gray-500 mt-1">{termo ? "Tente buscar por outro termo." : "Registre a primeira vistoria no botão acima."}</p>
          </div>
        )}

        {filtrados.map((l) => {
          const dados = l.dados as unknown as VistoriaWizardState;
          const dispensados = dados.setores.filter((s) => avaliarSetor(s, dados.cliente?.preexistente).dispensado).length;
          return (
            <div key={l.id} className="rounded-xl bg-white/[0.02] border border-white/[0.08] border-l-4 border-l-red-500 p-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-white/[0.04] border border-white/[0.08] rounded-full">{dados.codigo}</span>
                  <h3 className="text-white font-semibold">{dados.cliente?.razao_social}</h3>
                </div>
                <p className="text-xs text-gray-400">
                  <strong className="text-gray-300">Vistoriador:</strong> {dados.vistoriador_profissional?.nome || "N/A"} |{" "}
                  <strong className="text-gray-300">Setores:</strong> {dados.setores.length}
                  {dispensados > 0 && <> ({dispensados} dispensado(s))</>}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => router.push(`/relatorios/save-in23/vistorias/nova?editarId=${l.id}`)}
                  title="Editar vistoria"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-amber-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-amber-400 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBaixar(dados)}
                  title="Baixar relatório"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-emerald-400 transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExcluir(l.id)}
                  title="Excluir"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
