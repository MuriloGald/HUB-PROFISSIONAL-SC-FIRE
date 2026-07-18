"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RESPONSAVEIS_TECNICOS } from "@/lib/habitese/constants";
import { formatCPF, formatPhone } from "@/lib/laudos/formatters";
import type { ResponsavelTecnicoObra } from "@/lib/habitese/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface StepTecnicoProps {
  rt?: ResponsavelTecnicoObra;
  onBack: () => void;
  onNext: (rt: ResponsavelTecnicoObra) => void;
}

export function StepTecnico({ rt, onBack, onNext }: StepTecnicoProps) {
  const [chave, setChave] = useState<ResponsavelTecnicoObra["chave"]>(rt?.chave ?? "rt1");
  const [custom, setCustom] = useState(
    rt?.custom ?? { nome: "", cpf: "", telefone: "", email: "", registro: "" }
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext(chave === "outro" ? { chave, custom } : { chave });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Responsável Técnico pela Execução da Obra</h3>
      <p className="text-sm text-gray-400 -mt-4">Profissional que instalou/comissionou os sistemas de segurança contra incêndio no imóvel.</p>

      <div className="space-y-1.5">
        <label className={labelClass}>Responsável Técnico</label>
        <select
          className={inputClass}
          value={chave}
          onChange={(e) => setChave(e.target.value as ResponsavelTecnicoObra["chave"])}
        >
          {Object.entries(RESPONSAVEIS_TECNICOS).map(([key, r]) => (
            <option key={key} value={key} className="bg-[#111625]">
              {r.nome}
            </option>
          ))}
          <option value="outro" className="bg-[#111625]">Outro (profissional avulso)</option>
        </select>
      </div>

      {chave === "outro" && (
        <div className="space-y-4 rounded-xl bg-white/[0.02] border border-white/[0.08] p-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Nome</label>
            <input
              required
              className={inputClass}
              value={custom.nome}
              onChange={(e) => setCustom((c) => ({ ...c, nome: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>CPF</label>
              <input
                required
                className={inputClass}
                value={custom.cpf}
                onChange={(e) => setCustom((c) => ({ ...c, cpf: formatCPF(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Telefone</label>
              <input
                required
                className={inputClass}
                value={custom.telefone}
                onChange={(e) => setCustom((c) => ({ ...c, telefone: formatPhone(e.target.value) }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>E-mail</label>
              <input
                type="email"
                required
                className={inputClass}
                value={custom.email}
                onChange={(e) => setCustom((c) => ({ ...c, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Nº de Registro no Conselho de Classe</label>
              <input
                required
                className={inputClass}
                value={custom.registro}
                onChange={(e) => setCustom((c) => ({ ...c, registro: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}

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
