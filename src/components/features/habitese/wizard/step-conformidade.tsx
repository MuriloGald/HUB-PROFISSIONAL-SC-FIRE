"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SISTEMAS_CONFORMIDADE } from "@/lib/habitese/constants";
import type { ConformeStatus, SistemaConformidade } from "@/lib/habitese/types";

const selectClass =
  "w-full px-2 py-1.5 text-xs text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const inputClass =
  "w-full px-2 py-1.5 text-xs text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";

function estadoInicial(sistemas: SistemaConformidade[] | undefined): SistemaConformidade[] {
  return SISTEMAS_CONFORMIDADE.map(({ chave }) => {
    const existente = sistemas?.find((s) => s.chave === chave);
    return existente ?? { chave, conformePpci: "", conformeNsci: "", justificativa: "Não se aplica" };
  });
}

interface StepConformidadeProps {
  sistemas?: SistemaConformidade[];
  onBack: () => void;
  onNext: (sistemas: SistemaConformidade[]) => void;
}

export function StepConformidade({ sistemas, onBack, onNext }: StepConformidadeProps) {
  const [lista, setLista] = useState<SistemaConformidade[]>(() => estadoInicial(sistemas));

  function update(chave: string, patch: Partial<SistemaConformidade>) {
    setLista((prev) => prev.map((s) => (s.chave === chave ? { ...s, ...patch } : s)));
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Relatório de Conformidade dos Sistemas (Anexo H)</h3>
      <p className="text-sm text-gray-400 -mt-4">
        Para cada sistema/medida de segurança, informe se está em conformidade com o PPCI e com as NSCI, e a justificativa em caso de desconformidade ou não aplicabilidade.
      </p>

      <div className="rounded-xl border border-white/[0.08] overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/[0.04] text-gray-400 text-[10px] uppercase tracking-wider">
              <th className="text-left px-3 py-2 font-bold">Sistema</th>
              <th className="text-left px-3 py-2 font-bold w-28">PPCI</th>
              <th className="text-left px-3 py-2 font-bold w-28">NSCI</th>
              <th className="text-left px-3 py-2 font-bold">Justificativa</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((s, i) => {
              const label = SISTEMAS_CONFORMIDADE[i].label;
              return (
                <tr key={s.chave} className="border-t border-white/[0.04]">
                  <td className="px-3 py-2 text-white">{label}</td>
                  <td className="px-3 py-2">
                    <select
                      className={selectClass}
                      value={s.conformePpci}
                      onChange={(e) => update(s.chave, { conformePpci: e.target.value as ConformeStatus })}
                    >
                      <option value="" className="bg-[#111625]">-</option>
                      <option value="sim" className="bg-[#111625]">Sim</option>
                      <option value="nao" className="bg-[#111625]">Não</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className={selectClass}
                      value={s.conformeNsci}
                      onChange={(e) => update(s.chave, { conformeNsci: e.target.value as ConformeStatus })}
                    >
                      <option value="" className="bg-[#111625]">-</option>
                      <option value="sim" className="bg-[#111625]">Sim</option>
                      <option value="nao" className="bg-[#111625]">Não</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={inputClass}
                      value={s.justificativa}
                      onChange={(e) => update(s.chave, { justificativa: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
