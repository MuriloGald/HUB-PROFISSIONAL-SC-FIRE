"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileDown, Loader2 } from "lucide-react";
import { avaliarSetor } from "@/lib/save-in23/classificador";
import { salvarVistoria } from "@/app/actions/save-in23";
import type { VistoriaWizardState } from "@/lib/save-in23/types";

interface StepRevisaoProps {
  state: VistoriaWizardState;
  onBack: () => void;
  onClearDraft: () => void;
}

export function StepRevisao({ state, onBack, onClearDraft }: StepRevisaoProps) {
  const router = useRouter();
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleGerar() {
    setGerando(true);
    setErro(null);
    try {
      const result = await salvarVistoria(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar a vistoria.");
        return;
      }

      const salvo = { ...state, codigo: (result.data.dados as unknown as VistoriaWizardState).codigo, laudoId: result.data.id };
      const { gerarPdfVistoria } = await import("@/lib/save-in23/pdf-generator");
      await gerarPdfVistoria(salvo);

      onClearDraft();
      router.push("/relatorios/save-in23/vistorias");
      router.refresh();
    } catch (err) {
      console.error("Erro ao gerar vistoria:", err);
      setErro(err instanceof Error ? err.message : "Ocorreu um erro ao gerar o relatório.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Pronto para Gerar o Relatório!</h3>
        <p className="text-sm text-gray-400">Revise o resultado de cada setor antes de salvar e gerar o PDF.</p>
      </div>

      {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

      <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-4">
        <h4 className="text-sm font-bold text-red-400 border-b border-white/[0.08] pb-2">Resumo da Vistoria</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p><strong className="text-white">Edificação:</strong> {state.cliente?.razao_social || "N/A"}</p>
          <p><strong className="text-white">Vistoriador:</strong> {state.vistoriador || "N/A"}</p>
          <p><strong className="text-white">Responsável Técnico:</strong> {state.respTecnico || "N/A"}</p>
          <p><strong className="text-white">Setores avaliados:</strong> {state.setores.length}</p>
        </div>

        <div className="rounded-lg border border-white/[0.06] divide-y divide-white/[0.04]">
          {state.setores.map((s, i) => {
            const av = avaliarSetor(s, state.cliente?.preexistente);
            const cor = av.resultado === "DISPENSADO" ? "text-emerald-400" : av.resultado === "PBD EXIGIDO" ? "text-red-400" : "text-gray-500";
            return (
              <div key={s.id} className="flex items-center justify-between gap-4 px-3 py-2">
                <span className="text-xs text-gray-400">
                  {i + 1}. {s.nome || "Setor sem nome"}
                </span>
                <span className={`text-xs font-bold text-right ${cor}`}>
                  {av.resultado}
                  {av.enquadramento ? ` — Inciso ${av.enquadramento}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar e Editar
        </button>
        <button
          type="button"
          onClick={handleGerar}
          disabled={gerando}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
        >
          {gerando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
          Salvar e Gerar Relatório PDF
        </button>
      </div>
    </div>
  );
}
