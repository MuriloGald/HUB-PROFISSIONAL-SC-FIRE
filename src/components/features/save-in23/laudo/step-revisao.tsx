"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileDown, Loader2 } from "lucide-react";
import { salvarLaudoTecnico } from "@/app/actions/save-in23";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import type { LaudoTecnicoWizardState } from "@/lib/save-in23/types";

interface StepRevisaoProps {
  state: LaudoTecnicoWizardState;
  onBack: () => void;
  onClearDraft: () => void;
}

export function StepRevisao({ state, onBack, onClearDraft }: StepRevisaoProps) {
  const router = useRouter();
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const clausulasIncluidas = state.capitulo2.clausulas.filter((c) => c.incluir).length;
  const totalSubsecoes = state.capitulo3.cenarios.reduce((acc, c) => acc + c.subsecoes.length, 0);

  async function handleGerar() {
    setGerando(true);
    setErro(null);
    try {
      const result = await salvarLaudoTecnico(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o laudo.");
        return;
      }

      const salvo = { ...state, codigo: (result.data.dados as unknown as LaudoTecnicoWizardState).codigo, laudoId: result.data.id };
      const { gerarPdfLaudo } = await import("@/lib/save-in23/pdf-generator");
      await gerarPdfLaudo(salvo);

      onClearDraft();
      router.push("/relatorios/save-in23/laudos");
      router.refresh();
    } catch (err) {
      console.error("Erro ao gerar laudo:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. O laudo já foi salvo — tente baixar o PDF novamente."));
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Pronto para Gerar o Laudo Técnico!</h3>
        <p className="text-sm text-gray-400">Revise os dados abaixo antes de gerar o documento PDF.</p>
      </div>

      {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

      <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-2 text-sm text-gray-300">
        <h4 className="text-sm font-bold text-red-400 border-b border-white/[0.08] pb-2 mb-2">Resumo do Laudo</h4>
        <p><strong className="text-white">Título:</strong> {state.tituloDocumento || "N/A"}</p>
        <p><strong className="text-white">Edificação:</strong> {state.cliente?.razao_social || "N/A"}</p>
        <p><strong className="text-white">Responsável Técnico:</strong> {state.rt?.nome || "N/A"}</p>
        <p><strong className="text-white">Revisão:</strong> {state.revisao || "N/A"}</p>
        <p><strong className="text-white">Cláusulas incluídas (Cap. 2):</strong> {clausulasIncluidas}</p>
        <p><strong className="text-white">Cenários (Cap. 3):</strong> {state.capitulo3.cenarios.length} — {totalSubsecoes} subseção(ões)</p>
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
          Salvar e Gerar Laudo em PDF
        </button>
      </div>
    </div>
  );
}
