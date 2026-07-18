"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ClausulaLaudo } from "@/lib/save-in23/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";

interface StepCapitulo2Props {
  clausulas: ClausulaLaudo[];
  onBack: () => void;
  onNext: (clausulas: ClausulaLaudo[]) => void;
}

export function StepCapitulo2({ clausulas: clausulasIniciais, onBack, onNext }: StepCapitulo2Props) {
  const [clausulas, setClausulas] = useState<ClausulaLaudo[]>(clausulasIniciais);

  function toggle(id: string) {
    setClausulas((cs) => cs.map((c) => (c.id === id ? { ...c, incluir: !c.incluir } : c)));
  }
  function updateTexto(id: string, texto: string) {
    setClausulas((cs) => cs.map((c) => (c.id === id ? { ...c, texto } : c)));
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">2. Infraestrutura Elétrica, Segurança Ativa e Quadro Geral SAVE</h3>
        <p className="text-sm text-gray-400">Marque as cláusulas padrão que entram neste laudo — o texto de cada uma pode ser editado antes de salvar.</p>

        {clausulas.map((c) => (
          <div key={c.id} className={`rounded-xl border p-4 space-y-2 transition-all ${c.incluir ? "border-red-500/40 bg-red-500/5" : "border-white/[0.08]"}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={c.incluir} onChange={() => toggle(c.id)} className="mt-1 accent-red-500 w-4 h-4" />
              <span className="text-sm font-semibold text-white">{c.titulo}</span>
            </label>
            {c.incluir && (
              <textarea rows={4} className={inputClass} value={c.texto} onChange={(e) => updateTexto(c.id, e.target.value)} />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-white/[0.08] hover:border-white/20 text-gray-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          onClick={() => onNext(clausulas)}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
