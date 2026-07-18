"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ImageUploader } from "../image-uploader";
import type { Imagem } from "@/lib/habitese/types";

interface StepImagensProps {
  imagens: Imagem[];
  onBack: () => void;
  onNext: (imagens: Imagem[]) => void;
}

export function StepImagens({ imagens, onBack, onNext }: StepImagensProps) {
  const [lista, setLista] = useState<Imagem[]>(imagens);

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Descritivo dos Sistemas Instalados</h3>
      <p className="text-sm text-gray-400 -mt-4">
        Anexe no mínimo uma foto ilustrativa de cada sistema/medida de segurança contra incêndio executado no imóvel.
      </p>

      <ImageUploader imagens={lista} onChange={setLista} />

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          type="button"
          onClick={() => onNext(lista)}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
