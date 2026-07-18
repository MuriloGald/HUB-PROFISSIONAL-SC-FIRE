"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ListaEditavel } from "./lista-editavel";
import type { PlanoEnsinoWizardState } from "@/lib/plano-ensino/types";

const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";
const textareaClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all min-h-[90px] resize-y";

interface StepIdentificacaoProps {
  state: PlanoEnsinoWizardState;
  onBack: () => void;
  onNext: (partial: Partial<PlanoEnsinoWizardState>) => void;
}

export function StepIdentificacao({ state, onBack, onNext }: StepIdentificacaoProps) {
  const [ementa, setEmenta] = useState(state.ementa ?? "");
  const [objetivoGeral, setObjetivoGeral] = useState(state.objetivo_geral ?? "");
  const [objetivosEspecificos, setObjetivosEspecificos] = useState<string[]>(state.objetivos_especificos ?? []);

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Identificação Pedagógica</h3>

      <div className="space-y-1.5">
        <label className={labelClass}>Ementa</label>
        <textarea value={ementa} onChange={(e) => setEmenta(e.target.value)} className={textareaClass} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Objetivo Geral</label>
        <textarea value={objetivoGeral} onChange={(e) => setObjetivoGeral(e.target.value)} className={textareaClass} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Objetivos Específicos</label>
        <ListaEditavel itens={objetivosEspecificos} onChange={setObjetivosEspecificos} placeholder="Adicionar objetivo específico..." />
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
          onClick={() => onNext({ ementa, objetivo_geral: objetivoGeral, objetivos_especificos: objetivosEspecificos })}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
