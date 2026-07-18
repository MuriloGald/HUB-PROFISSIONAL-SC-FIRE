"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";

interface StepCapitulo4Props {
  texto?: string;
  onBack: () => void;
  onNext: (texto: string) => void;
}

export function StepCapitulo4({ texto: textoInicial, onBack, onNext }: StepCapitulo4Props) {
  const [texto, setTexto] = useState(textoInicial ?? "");

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">4. Conclusão e Parecer Técnico</h3>
        <textarea
          rows={10}
          className={inputClass}
          placeholder="Diante da análise das condições arquitetônicas e dos sistemas preventivos..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-white/[0.08] hover:border-white/20 text-gray-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          onClick={() => onNext(texto)}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Avançar para Revisão <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
