"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { PAGINAS_APOSTILA_BRIGADA, CAPITULOS_APOSTILA_BRIGADA, APOSTILA_BASE_PATH } from "@/lib/ava/apostila-brigada";

/** Leitor da apostila (páginas exportadas como imagem) — navegação por capítulo ou página a página. */
export function ApostilaViewer() {
  const [pagina, setPagina] = useState(0);

  const capituloAtual = [...CAPITULOS_APOSTILA_BRIGADA].reverse().find((c) => pagina >= c.paginaInicial);
  const ultima = PAGINAS_APOSTILA_BRIGADA.length - 1;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-1 px-1">
        {CAPITULOS_APOSTILA_BRIGADA.map((c) => (
          <button
            key={c.titulo}
            onClick={() => setPagina(c.paginaInicial)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              capituloAtual?.titulo === c.titulo ? "bg-red-500 text-white" : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"
            }`}
          >
            {c.titulo}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center bg-black/30 rounded-xl border border-white/[0.08] overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={pagina}
          src={`${APOSTILA_BASE_PATH}/${PAGINAS_APOSTILA_BRIGADA[pagina].arquivo}`}
          alt={`Página ${pagina + 1} da apostila`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between pt-3">
        <button
          onClick={() => setPagina((p) => Math.max(p - 1, 0))}
          disabled={pagina === 0}
          className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> {pagina + 1} / {ultima + 1}
        </span>
        <button
          onClick={() => setPagina((p) => Math.min(p + 1, ultima))}
          disabled={pagina === ultima}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
        >
          Próxima <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
