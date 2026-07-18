"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ListaEditavel } from "./lista-editavel";
import type { PlanoEnsinoWizardState } from "@/lib/plano-ensino/types";

const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";
const textareaClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all min-h-[90px] resize-y";

interface StepAvaliacaoProps {
  state: PlanoEnsinoWizardState;
  onBack: () => void;
  onNext: (partial: Partial<PlanoEnsinoWizardState>) => void;
}

export function StepAvaliacao({ state, onBack, onNext }: StepAvaliacaoProps) {
  const [criteriosAvaliacao, setCriteriosAvaliacao] = useState(state.criterios_avaliacao ?? "");
  const [bibliografiaBasica, setBibliografiaBasica] = useState<string[]>(state.bibliografia_basica ?? []);
  const [bibliografiaComplementar, setBibliografiaComplementar] = useState<string[]>(state.bibliografia_complementar ?? []);

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Avaliação e Bibliografia</h3>

      <div className="space-y-1.5">
        <label className={labelClass}>Critérios de Avaliação</label>
        <textarea value={criteriosAvaliacao} onChange={(e) => setCriteriosAvaliacao(e.target.value)} className={textareaClass} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Bibliografia Básica</label>
        <ListaEditavel itens={bibliografiaBasica} onChange={setBibliografiaBasica} placeholder="Adicionar referência..." />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Bibliografia Complementar</label>
        <ListaEditavel itens={bibliografiaComplementar} onChange={setBibliografiaComplementar} placeholder="Adicionar referência..." />
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          type="button"
          onClick={() =>
            onNext({
              criterios_avaliacao: criteriosAvaliacao,
              bibliografia_basica: bibliografiaBasica,
              bibliografia_complementar: bibliografiaComplementar,
            })
          }
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
