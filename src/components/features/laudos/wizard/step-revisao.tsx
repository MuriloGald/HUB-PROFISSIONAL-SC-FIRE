"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileDown, Loader2 } from "lucide-react";
import { PERGUNTAS_MAP } from "@/lib/laudos/constants";
import { formatDateBR } from "@/lib/laudos/formatters";
import { salvarLaudoEvento } from "@/app/actions/laudos";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import type { EventoWizardState } from "@/lib/laudos/types";

function displayValor(valor: string): string {
  if (valor === "sim") return "Sim";
  if (valor === "nao") return "Não";
  if (valor === "na") return "Não se aplica";
  if (valor === "manual_auto") return "Manual ou automatizado";
  if (valor === "automatizado") return "Automatizado (>1.000 pessoas)";
  if (valor === "rt1") return "Dione Borges";
  if (valor === "rt2") return "Paulo Roberto Ramos";
  return valor;
}

interface StepRevisaoProps {
  state: EventoWizardState;
  onBack: () => void;
  onClearDraft: () => void;
}

export function StepRevisao({ state, onBack, onClearDraft }: StepRevisaoProps) {
  const router = useRouter();
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const respostas = state.respostas_pequeno || state.respostas_medio || state.respostas_grande || {};

  async function handleGerar() {
    setGerando(true);
    setErro(null);
    try {
      const { gerarPdf } = await import("@/lib/laudos/pdf-generator");
      gerarPdf(state);

      const result = await salvarLaudoEvento(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o laudo.");
        return;
      }

      onClearDraft();
      router.push("/laudos/eventos");
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
        <h3 className="text-lg font-bold text-white">Pronto para Gerar o Laudo!</h3>
        <p className="text-sm text-gray-400">Revise os dados abaixo antes de gerar o documento PDF.</p>
      </div>

      {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

      <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-4">
        <h4 className="text-sm font-bold text-red-400 border-b border-white/[0.08] pb-2">Resumo do Evento</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p><strong className="text-white">Evento:</strong> {state.nome_evento}</p>
          <p><strong className="text-white">Cliente Responsável:</strong> {state.cliente?.razao_social || "N/A"}</p>
          <p><strong className="text-white">Período:</strong> {formatDateBR(state.data_inicio)} até {formatDateBR(state.data_termino)}</p>
          <p><strong className="text-white">Porte Classificado:</strong> <span className="capitalize">{state.porteFinal}</span></p>
        </div>

        <h4 className="text-sm font-bold text-red-400 border-b border-white/[0.08] pb-2 pt-2">Respostas do Questionário</h4>
        <div className="max-h-80 overflow-y-auto rounded-lg border border-white/[0.06]">
          {Object.entries(respostas)
            .filter(([key, value]) => key !== "subStep" && key !== "locais" && value !== "")
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-4 px-3 py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-xs text-gray-400 flex-1">{PERGUNTAS_MAP[key] || key}</span>
                <span className="text-xs font-semibold text-white text-right">{displayValor(value)}</span>
              </div>
            ))}
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
          Gerar Documento PDF
        </button>
      </div>
    </div>
  );
}
