"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RISCOS } from "@/lib/habitese/constants";
import type { HabiteseWizardState, Risco } from "@/lib/habitese/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface StepSolicitacaoProps {
  state: HabiteseWizardState;
  onBack: () => void;
  onNext: (partial: Partial<HabiteseWizardState>) => void;
}

export function StepSolicitacao({ state, onBack, onNext }: StepSolicitacaoProps) {
  const [form, setForm] = useState({
    area_total: state.area_total ?? "",
    protocolo: state.protocolo ?? "",
    area_alteracao: state.area_alteracao ?? "",
    ocupacao: state.ocupacao ?? "",
    risco: state.risco ?? ("II" as Risco),
    pavimentos_blocos: state.pavimentos_blocos ?? "",
    observacoes: state.observacoes ?? "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext(form);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Dados da Solicitação</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Área Total da Solicitação (m²)</label>
          <input required className={inputClass} value={form.area_total} onChange={(e) => update("area_total", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Protocolo</label>
          <input className={inputClass} value={form.protocolo} onChange={(e) => update("protocolo", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Área da Alteração/Ampliação/Reforma</label>
          <input className={inputClass} value={form.area_alteracao} onChange={(e) => update("area_alteracao", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Ocupação(ões)</label>
          <input className={inputClass} value={form.ocupacao} onChange={(e) => update("ocupacao", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Risco</label>
          <div className="flex gap-4 pt-1.5">
            {RISCOS.map((r) => (
              <label key={r} className="flex items-center gap-1.5 text-sm text-white cursor-pointer">
                <input type="radio" name="risco" checked={form.risco === r} onChange={() => update("risco", r)} className="accent-red-500" />
                {r}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº de Pavimentos/Blocos</label>
          <input className={inputClass} value={form.pavimentos_blocos} onChange={(e) => update("pavimentos_blocos", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Observações</label>
        <textarea rows={3} className={inputClass} value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} />
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
