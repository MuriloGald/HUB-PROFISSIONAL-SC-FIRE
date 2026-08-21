"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Eye, Pencil, Download, FileCheck2, Trash2, FileSignature, X } from "lucide-react";
import { excluirTermoHabitese } from "@/app/actions/habitese";
import type { Laudo } from "@/lib/supabase/types";
import type { HabiteseWizardState } from "@/lib/habitese/types";

export function TermosList({ laudos }: { laudos: Laudo[] }) {
  const router = useRouter();
  const [termo, setTermo] = useState("");
  const [detalhes, setDetalhes] = useState<HabiteseWizardState | null>(null);

  const filtrados = useMemo(() => {
    const t = termo.toLowerCase();
    return laudos.filter((l) => {
      const dados = l.dados as HabiteseWizardState;
      return dados.cliente?.razao_social?.toLowerCase().includes(t) || dados.codigo?.toLowerCase().includes(t);
    });
  }, [laudos, termo]);

  async function handleExcluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir este termo? Essa ação não pode ser desfeita.")) return;
    await excluirTermoHabitese(id);
    router.refresh();
  }

  async function handleBaixar(dados: HabiteseWizardState) {
    const { gerarPdf } = await import("@/lib/habitese/pdf-generator");
    await gerarPdf(dados);
  }

  async function handleBaixarAnexoI(dados: HabiteseWizardState) {
    const { gerarPdfAnexoI } = await import("@/lib/habitese/pdf-generator");
    await gerarPdfAnexoI(dados);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Consultar Termos</h1>
          <p className="text-sm text-gray-400 mt-1">Histórico de Termos de Entrega do Imóvel já emitidos.</p>
        </div>
        <button
          onClick={() => router.push("/habitese/novo")}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Termo
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por código (HAB-2026-001) ou nome do proprietário..."
          className="w-full pl-10 pr-3 py-2.5 text-sm text-white bg-white/[0.02] border border-white/[0.08] rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        />
      </div>

      <div className="grid gap-3">
        {filtrados.length === 0 && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center py-12">
            <FileSignature className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-gray-400 font-semibold">Nenhum termo emitido ainda</h3>
            <p className="text-xs text-gray-500 mt-1">{termo ? "Tente buscar por outro termo." : "Gere o seu primeiro termo no botão acima."}</p>
          </div>
        )}

        {filtrados.map((l) => {
          const dados = l.dados as HabiteseWizardState;
          return (
            <div key={l.id} className="rounded-xl bg-white/[0.02] border border-white/[0.08] border-l-4 border-l-red-500 p-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-white/[0.04] border border-white/[0.08] rounded-full">{dados.codigo}</span>
                  <h3 className="text-white font-semibold">{dados.cliente?.razao_social || "Sem proprietário"}</h3>
                </div>
                <p className="text-xs text-gray-400">
                  <strong className="text-gray-300">RE:</strong> {dados.imovel_re || "-"} |{" "}
                  <strong className="text-gray-300">Protocolo:</strong> {dados.protocolo || "-"} |{" "}
                  <strong className="text-gray-300">Risco:</strong> {dados.risco || "-"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDetalhes(dados)}
                  title="Ver detalhes"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 transition-all"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push(`/habitese/novo?editarId=${l.id}`)}
                  title="Editar e gerar novamente"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-amber-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-amber-400 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBaixar(dados)}
                  title="Baixar Termo de Entrega do Imóvel (PDF)"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-emerald-400 transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBaixarAnexoI(dados)}
                  title="Baixar Anexo I — Relatório de Conformidade (PDF)"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-blue-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-blue-400 transition-all"
                >
                  <FileCheck2 className="w-4 h-4" />
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

      {detalhes && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDetalhes(null)}>
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#111625] border border-white/[0.08] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-red-500" /> Detalhes do Termo ({detalhes.codigo})
              </h3>
              <button onClick={() => setDetalhes(null)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300 mb-4">
              <div><strong className="text-white">Proprietário:</strong> {detalhes.cliente?.razao_social}</div>
              <div><strong className="text-white">RE:</strong> {detalhes.imovel_re || "-"}</div>
              <div><strong className="text-white">Protocolo:</strong> {detalhes.protocolo || "-"}</div>
              <div><strong className="text-white">Área total:</strong> {detalhes.area_total || "-"} m²</div>
              <div><strong className="text-white">Ocupação:</strong> {detalhes.ocupacao || "-"}</div>
              <div><strong className="text-white">Risco:</strong> {detalhes.risco || "-"}</div>
              <div><strong className="text-white">Pavimentos/Blocos:</strong> {detalhes.pavimentos_blocos || "-"}</div>
              <div><strong className="text-white">Emissão:</strong> {detalhes.data_emissao ? new Date(detalhes.data_emissao).toLocaleString("pt-BR") : "-"}</div>
            </div>

            <h4 className="text-sm font-bold text-red-400 mb-2">Quantidades</h4>
            <div className="rounded-lg border border-white/[0.08] mb-2 text-xs text-gray-300 divide-y divide-white/[0.04]">
              <div className="flex items-center justify-between px-3 py-2">
                <span>Extintores (quantidade total)</span><span className="font-semibold text-white">{detalhes.extintores_qtd || "0"}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span>Iluminação de emergência</span><span className="font-semibold text-white">{detalhes.iluminacao_qtd || "0"}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span>Placa saída fotoluminescente</span><span className="font-semibold text-white">{detalhes.placa_qtd || "0"}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span>Placa saída luminosa</span><span className="font-semibold text-white">{detalhes.placa_luminosa_qtd || "0"}</span>
              </div>
            </div>

            {detalhes.observacoes && (
              <>
                <h4 className="text-sm font-bold text-red-400 mb-2 mt-4">Observações</h4>
                <p className="text-xs text-gray-300">{detalhes.observacoes}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
