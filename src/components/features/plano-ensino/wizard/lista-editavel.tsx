"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface ListaEditavelProps {
  itens: string[];
  onChange: (itens: string[]) => void;
  placeholder?: string;
}

/** Editor de lista de textos simples (add/remove) — usado para objetivos específicos e bibliografia. */
export function ListaEditavel({ itens, onChange, placeholder }: ListaEditavelProps) {
  const [novo, setNovo] = useState("");

  function adicionar() {
    if (!novo.trim()) return;
    onChange([...itens, novo.trim()]);
    setNovo("");
  }

  function remover(i: number) {
    onChange(itens.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      {itens.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="flex-1 px-3 py-2 text-sm text-gray-200 bg-black/20 border border-white/[0.08] rounded-lg">{item}</span>
          <button
            type="button"
            onClick={() => remover(i)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        />
        <button
          type="button"
          onClick={adicionar}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
