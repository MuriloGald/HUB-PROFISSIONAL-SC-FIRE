"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Question } from "./question";
import { PERGUNTAS_MAP } from "@/lib/laudos/constants";
import type { Respostas } from "@/lib/laudos/types";

interface FormsPequenoProps {
  respostas: Respostas;
  onBack: (respostas: Respostas) => void;
  onNext: (respostas: Respostas) => void;
}

/** Questionário de evento de Pequeno Porte (Anexo B). */
export function FormsPequeno({ respostas: inicial, onBack, onNext }: FormsPequenoProps) {
  const [respostas, setRespostas] = useState<Respostas>(inicial);

  function set(key: string, value: string) {
    setRespostas((r) => ({ ...r, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext(respostas);
  }

  const camposGerais = ["CGPP01", "CGPP02", "CGPP03", "CGPP04"];
  const camposProvisorias = ["PROVISORIAPP01", "PROVISORIAPP02", "PROVISORIAPP03", "PROVISORIAPP04"];

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Preenchimento: Evento de Pequeno Porte</h3>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Características gerais</h4>
      {camposGerais.map((key) => (
        <Question key={key} name={key} label={PERGUNTAS_MAP[key]} value={respostas[key]} onChange={(v) => set(key, v)} />
      ))}

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Instalações de Gás Combustível</h4>
      <Question name="GLPPP" label={PERGUNTAS_MAP.GLPPP} value={respostas.GLPPP} onChange={(v) => set("GLPPP", v)} />

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Estruturas provisórias</h4>
      {camposProvisorias.map((key) => (
        <Question key={key} name={key} label={PERGUNTAS_MAP[key]} value={respostas[key]} onChange={(v) => set(key, v)} />
      ))}

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Responsável Técnico (RT)</h4>
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selecione o RT que assinará o Laudo</label>
        <select
          required
          value={respostas.rt_selecionado ?? ""}
          onChange={(e) => set("rt_selecionado", e.target.value)}
          className="w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        >
          <option value="" className="bg-[#111625]">-- Selecione --</option>
          <option value="rt1" className="bg-[#111625]">Dione Borges</option>
          <option value="rt2" className="bg-[#111625]">Paulo Roberto Ramos</option>
        </select>
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => onBack(respostas)}
          className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Revisar e Gerar PDF <Check className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
