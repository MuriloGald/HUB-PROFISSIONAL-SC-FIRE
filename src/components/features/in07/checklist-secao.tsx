"use client";

import type { SecaoChecklist } from "@/lib/in07/constants";
import type { RespostaChecklist } from "@/lib/in07/types";

interface ChecklistSecaoProps {
  secao: SecaoChecklist;
  respostas: Record<string, RespostaChecklist>;
  onChange: (chave: string, resposta: RespostaChecklist) => void;
}

/** Uma seção do checklist do Anexo C (IN 07) — lista de itens com toggle Sim/Não/Não avaliado. */
export function ChecklistSecao({ secao, respostas, onChange }: ChecklistSecaoProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">
        {secao.numero}. {secao.titulo}
      </h4>
      <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] overflow-hidden">
        {secao.itens.map((item) => {
          const valor = respostas[item.chave] ?? "";
          return (
            <div key={item.chave} className="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02]">
              <p className="text-xs text-gray-300 flex-1">
                <span className="text-gray-500 font-semibold mr-1.5">{item.chave}</span>
                {item.texto}
              </p>
              <div className="flex rounded-lg border border-white/[0.08] overflow-hidden flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onChange(item.chave, "sim")}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all ${valor === "sim" ? "bg-emerald-500 text-white" : "text-gray-400 hover:bg-white/[0.04]"}`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => onChange(item.chave, "nao")}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all border-l border-white/[0.08] ${valor === "nao" ? "bg-red-500 text-white" : "text-gray-400 hover:bg-white/[0.04]"}`}
                >
                  Não
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
