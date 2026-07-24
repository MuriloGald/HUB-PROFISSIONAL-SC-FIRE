"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Eye, Pencil, Download, Trash2, FileSignature, Flame, X } from "lucide-react";
import { excluirLaudoEvento } from "@/app/actions/laudos";
import { PERGUNTAS_MAP } from "@/lib/laudos/constants";
import { formatDateBR } from "@/lib/laudos/formatters";
import type { Laudo } from "@/lib/supabase/types";
import type { EventoWizardState } from "@/lib/laudos/types";

function displayValor(valor: string): string {
  if (valor === "sim") return "Sim";
  if (valor === "nao") return "Não";
  if (valor === "na") return "Não se aplica";
  if (valor === "manual_auto") return "Manual ou automatizado";
  if (valor === "automatizado") return "Automatizado (>1.000 pessoas)";
  return valor;
}

export function EventosList({ laudos }: { laudos: Laudo[] }) {
  const router = useRouter();
  const [termo, setTermo] = useState("");
  const [detalhes, setDetalhes] = useState<EventoWizardState | null>(null);

  const filtrados = useMemo(() => {
    const t = termo.toLowerCase();
    return laudos.filter((l) => {
      const dados = l.dados as EventoWizardState;
      return dados.nome_evento?.toLowerCase().includes(t) || dados.codigo?.toLowerCase().includes(t);
    });
  }, [laudos, termo]);

  async function handleExcluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir este laudo? Essa ação não pode ser desfeita.")) return;
    await excluirLaudoEvento(id);
    router.refresh();
  }

  async function handleBaixar(dados: EventoWizardState, tipo: "ambos" | "anexod" | "anexoe" = "ambos") {
    const { gerarPdf } = await import("@/lib/laudos/pdf-generator");
    gerarPdf(dados, tipo);
  }

  /** Segunda via com a identidade visual da SC Fire — a oficial pro CBMSC continua sendo handleBaixar. */
  async function handleBaixarSCFire(dados: EventoWizardState, tipo: "ambos" | "anexod" | "anexoe" = "ambos") {
    const { gerarPdfIdentidadeVisual } = await import("@/lib/laudos/pdf-generator");
    await gerarPdfIdentidadeVisual(dados, tipo);
  }

  const respostasDetalhes = detalhes
    ? detalhes.respostas_pequeno || detalhes.respostas_medio || detalhes.respostas_grande || {}
    : {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Consultar Eventos e Laudos</h1>
          <p className="text-sm text-gray-400 mt-1">Histórico de eventos já cadastrados e gerados (IN 24).</p>
        </div>
        <button
          onClick={() => router.push("/laudos/eventos/novo")}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Evento
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por código (EVT-2026-001) ou nome do evento..."
          className="w-full pl-10 pr-3 py-2.5 text-sm text-white bg-white/[0.02] border border-white/[0.08] rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        />
      </div>

      <div className="grid gap-3">
        {filtrados.length === 0 && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center py-12">
            <FileSignature className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-gray-400 font-semibold">Nenhum evento emitido ainda</h3>
            <p className="text-xs text-gray-500 mt-1">{termo ? "Tente buscar por outro termo." : "Gere o seu primeiro laudo no botão acima."}</p>
          </div>
        )}

        {filtrados.map((l) => {
          const dados = l.dados as EventoWizardState;
          const grande = dados.porteFinal === "grande";
          return (
            <div key={l.id} className="rounded-xl bg-white/[0.02] border border-white/[0.08] border-l-4 border-l-red-500 p-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-white/[0.04] border border-white/[0.08] rounded-full">{dados.codigo}</span>
                  <h3 className="text-white font-semibold">{dados.nome_evento}</h3>
                </div>
                <p className="text-xs text-gray-400">
                  <strong className="text-gray-300">Responsável:</strong> {dados.cliente?.razao_social || "Desconhecido"} |{" "}
                  <strong className="text-gray-300">Data:</strong> {formatDateBR(dados.data_inicio)} até {formatDateBR(dados.data_termino)}
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
                  onClick={() => router.push(`/laudos/eventos/novo?editarId=${l.id}`)}
                  title="Editar e gerar novamente"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-amber-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-amber-400 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {grande ? (
                  <>
                    <button
                      onClick={() => handleBaixar(dados, "anexod")}
                      className="px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      Anexo D
                    </button>
                    <button
                      onClick={() => handleBaixar(dados, "anexoe")}
                      className="px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      Anexo E
                    </button>
                    <button
                      onClick={() => handleBaixarSCFire(dados, "ambos")}
                      title="Baixar via com identidade visual SC Fire (D + E)"
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 transition-all"
                    >
                      <Flame className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleBaixar(dados)}
                      title="Baixar laudo (padrão CBMSC)"
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-emerald-400 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleBaixarSCFire(dados)}
                      title="Baixar via com identidade visual SC Fire"
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 transition-all"
                    >
                      <Flame className="w-4 h-4" />
                    </button>
                  </>
                )}
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
                <FileSignature className="w-4 h-4 text-red-500" /> Detalhes do Evento ({detalhes.codigo})
              </h3>
              <button onClick={() => setDetalhes(null)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300 mb-6">
              <div><strong className="text-white">Nome:</strong> {detalhes.nome_evento}</div>
              <div><strong className="text-white">Porte:</strong> <span className="capitalize">{detalhes.porteFinal}</span></div>
              <div><strong className="text-white">Data:</strong> {formatDateBR(detalhes.data_inicio)} até {formatDateBR(detalhes.data_termino)}</div>
              <div><strong className="text-white">Público:</strong> {detalhes.publico} pessoas</div>
              <div><strong className="text-white">Responsável:</strong> {detalhes.cliente?.razao_social}</div>
              <div><strong className="text-white">Emissão:</strong> {detalhes.data_emissao ? new Date(detalhes.data_emissao).toLocaleString("pt-BR") : "-"}</div>
            </div>

            <h4 className="text-sm font-bold text-red-400 mb-2">Respostas do Questionário</h4>
            <div className="rounded-lg border border-white/[0.08] mb-2">
              {Object.entries(respostasDetalhes)
                .filter(([key, value]) => key !== "subStep" && key !== "locais" && value !== "")
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-4 px-3 py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-xs text-gray-400 flex-1">{PERGUNTAS_MAP[key] || key}</span>
                    <span className="text-xs font-semibold text-white text-right">{displayValor(value)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
