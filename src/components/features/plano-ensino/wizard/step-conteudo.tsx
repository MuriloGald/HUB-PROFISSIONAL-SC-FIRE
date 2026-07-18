"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import type { PlanoEnsinoWizardState, SubtemaPlano } from "@/lib/plano-ensino/types";

const inputClass =
  "px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";
const textareaClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all min-h-[90px] resize-y";

interface StepConteudoProps {
  state: PlanoEnsinoWizardState;
  onBack: () => void;
  onNext: (partial: Partial<PlanoEnsinoWizardState>) => void;
}

export function StepConteudo({ state, onBack, onNext }: StepConteudoProps) {
  const [conteudo, setConteudo] = useState<SubtemaPlano[]>(state.conteudo_programatico ?? []);
  const [metodologia, setMetodologia] = useState(state.metodologia ?? "");
  const [recursos, setRecursos] = useState(state.recursos_didaticos ?? "");

  function atualizarLinha(i: number, campo: "nome" | "horas", valor: string) {
    setConteudo((c) => c.map((l, idx) => (idx === i ? { ...l, [campo]: campo === "horas" ? Number(valor) || 0 : valor } : l)));
  }

  function removerLinha(i: number) {
    setConteudo((c) => c.filter((_, idx) => idx !== i));
  }

  function adicionarLinha() {
    setConteudo((c) => [...c, { subtheme_id: `custom-${Date.now()}`, nome: "", horas: 0, sort_order: c.length }]);
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Conteúdo Programático</h3>
        <p className="text-xs text-gray-500 mt-1">Pré-carregado a partir dos subtemas do curso selecionado — ajuste as horas ou adicione tópicos extras.</p>
      </div>

      <div className="space-y-2">
        {conteudo.map((linha, i) => (
          <div key={`${linha.subtheme_id}-${i}`} className="flex items-center gap-2">
            <input
              value={linha.nome}
              onChange={(e) => atualizarLinha(i, "nome", e.target.value)}
              placeholder="Tópico"
              className={`${inputClass} flex-1`}
            />
            <input
              type="number"
              min={0}
              value={linha.horas}
              onChange={(e) => atualizarLinha(i, "horas", e.target.value)}
              className={`${inputClass} w-24`}
            />
            <button
              type="button"
              onClick={() => removerLinha(i)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={adicionarLinha}
          className="inline-flex items-center gap-2 px-3 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Tópico
        </button>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Metodologia de Ensino</label>
        <textarea value={metodologia} onChange={(e) => setMetodologia(e.target.value)} className={textareaClass} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Recursos Didáticos</label>
        <textarea value={recursos} onChange={(e) => setRecursos(e.target.value)} className={textareaClass} />
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
          onClick={() => onNext({ conteudo_programatico: conteudo, metodologia, recursos_didaticos: recursos })}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
