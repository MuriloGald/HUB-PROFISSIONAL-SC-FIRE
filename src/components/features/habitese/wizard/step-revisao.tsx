"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileDown, Loader2 } from "lucide-react";
import { RESPONSAVEIS_TECNICOS } from "@/lib/habitese/constants";
import { salvarTermoHabitese } from "@/app/actions/habitese";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import type { HabiteseWizardState } from "@/lib/habitese/types";

function nomeRt(state: HabiteseWizardState): string {
  if (state.rt?.chave === "outro") return state.rt.custom?.nome || "Não informado";
  return RESPONSAVEIS_TECNICOS[state.rt?.chave ?? "rt1"].nome;
}

interface StepRevisaoProps {
  state: HabiteseWizardState;
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
      const result = await salvarTermoHabitese(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o termo.");
        return;
      }

      const { gerarPdf, gerarPdfAnexoH } = await import("@/lib/habitese/pdf-generator");
      const dados = result.data.dados as HabiteseWizardState;
      await gerarPdf(dados);
      await gerarPdfAnexoH(dados);

      onClearDraft();
      router.push("/habitese/termos");
      router.refresh();
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Pronto para Gerar o Termo!</h3>
        <p className="text-sm text-gray-400">Revise os dados abaixo antes de gerar o documento PDF.</p>
      </div>

      {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

      <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-4">
        <h4 className="text-sm font-bold text-red-400 border-b border-white/[0.08] pb-2">Resumo do Termo</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p><strong className="text-white">Responsável pelo Imóvel:</strong> {state.cliente?.razao_social || "N/A"}</p>
          <p><strong className="text-white">RE do Imóvel:</strong> {state.imovel_re || "-"}</p>
          <p><strong className="text-white">Responsável Técnico:</strong> {nomeRt(state)}</p>
          <p><strong className="text-white">Área Total:</strong> {state.area_total || "-"} m²</p>
          <p><strong className="text-white">Ocupação:</strong> {state.ocupacao || "-"}</p>
          <p><strong className="text-white">Risco:</strong> {state.risco || "-"}</p>
          <p><strong className="text-white">Nº de Pavimentos/Blocos:</strong> {state.pavimentos_blocos || "-"}</p>
        </div>

        <h4 className="text-sm font-bold text-red-400 border-b border-white/[0.08] pb-2 pt-2">Equipamentos</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p><strong className="text-white">Extintor PQS 4KG:</strong> {state.extintores_qtd || "0"}</p>
          <p><strong className="text-white">Iluminação de Emergência:</strong> {state.iluminacao_qtd || "0"}</p>
          <p><strong className="text-white">Placa Saída Fotoluminescente:</strong> {state.placa_qtd || "0"}</p>
          <p><strong className="text-white">Fotos anexadas:</strong> {state.imagens?.length ?? 0}</p>
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
          Gerar Termo + Anexo H (PDF)
        </button>
      </div>
    </div>
  );
}
