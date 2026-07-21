"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileDown, FileCheck2, Loader2, PartyPopper } from "lucide-react";
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
  const [salvando, setSalvando] = useState(false);
  const [baixandoTermo, setBaixandoTermo] = useState(false);
  const [baixandoAnexoI, setBaixandoAnexoI] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState<HabiteseWizardState | null>(null);

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarTermoHabitese(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o termo.");
        return;
      }
      setSalvo(result.data.dados as HabiteseWizardState);
    } catch (err) {
      console.error("Erro ao salvar o termo:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao salvar o termo. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  // Baixar os dois PDFs precisa ser 2 cliques separados (2 gestos do usuário) —
  // navegadores bloqueiam o segundo download automático quando os dois disparam
  // dentro do mesmo clique/handler.
  async function handleBaixarTermo() {
    if (!salvo) return;
    setBaixandoTermo(true);
    setErro(null);
    try {
      const { gerarPdf } = await import("@/lib/habitese/pdf-generator");
      await gerarPdf(salvo);
    } catch (err) {
      console.error("Erro ao gerar o Termo:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF do Termo. Tente novamente."));
    } finally {
      setBaixandoTermo(false);
    }
  }

  async function handleBaixarAnexoI() {
    if (!salvo) return;
    setBaixandoAnexoI(true);
    setErro(null);
    try {
      const { gerarPdfAnexoI } = await import("@/lib/habitese/pdf-generator");
      await gerarPdfAnexoI(salvo);
    } catch (err) {
      console.error("Erro ao gerar o Anexo I:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF do Anexo I. Tente novamente."));
    } finally {
      setBaixandoAnexoI(false);
    }
  }

  function handleConcluir() {
    onClearDraft();
    router.push("/habitese/termos");
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">{salvo ? "Termo Salvo!" : "Pronto para Salvar o Termo!"}</h3>
        <p className="text-sm text-gray-400">
          {salvo
            ? "Baixe os dois documentos abaixo (são 2 arquivos separados — o navegador pode pedir confirmação para o segundo download)."
            : "Revise os dados abaixo antes de salvar e gerar os documentos PDF."}
        </p>
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

      {!salvo ? (
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
            onClick={handleSalvar}
            disabled={salvando}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {salvando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Salvar Termo
          </button>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={handleBaixarTermo}
              disabled={baixandoTermo}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {baixandoTermo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              1. Baixar Termo de Entrega (PDF)
            </button>
            <button
              type="button"
              onClick={handleBaixarAnexoI}
              disabled={baixandoAnexoI}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {baixandoAnexoI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck2 className="w-3.5 h-3.5" />}
              2. Baixar Anexo I (PDF)
            </button>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleConcluir}
              className="px-4 py-2 border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-white hover:text-emerald-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <PartyPopper className="w-3.5 h-3.5" /> Concluir e Voltar para Consultar Termos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
