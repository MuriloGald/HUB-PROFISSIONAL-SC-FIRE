"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import type { Profissional } from "@/lib/supabase/types";
import type { ProfissionalSnapshot } from "@/lib/profissionais/types";
import { profissionalParaSnapshot, rotuloIdentificacaoProfissional } from "@/lib/profissionais/snapshot";

interface ProfissionalPickerProps {
  profissionais: Profissional[];
  profissionalIdInicial?: string;
  /** Para onde voltar depois de cadastrar um profissional novo a partir daqui (ex: o wizard que chamou este picker). */
  redirectToNovoProfissional: string;
  titulo?: string;
  onNext: (profissionalId: string, profissional: ProfissionalSnapshot) => void;
}

/** Seletor de Responsável Técnico compartilhado por todos os wizards de documento — consulta a base única de profissionais. */
export function ProfissionalPicker({
  profissionais,
  profissionalIdInicial,
  redirectToNovoProfissional,
  titulo = "Selecione o Responsável Técnico",
  onNext,
}: ProfissionalPickerProps) {
  const [selecionado, setSelecionado] = useState(profissionalIdInicial ?? "");

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">{titulo}</h3>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Profissional cadastrado</label>
        <select
          value={selecionado}
          onChange={(e) => setSelecionado(e.target.value)}
          className="w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        >
          <option value="" className="bg-[#111625]">
            -- Selecione --
          </option>
          {profissionais.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#111625]">
              {p.nome} ({rotuloIdentificacaoProfissional(p)})
            </option>
          ))}
        </select>
      </div>

      <div className="text-center text-xs text-gray-500">ou</div>

      <div className="text-center">
        <Link
          href={`/profissionais/novo?redirectTo=${encodeURIComponent(redirectToNovoProfissional)}`}
          className="inline-flex items-center gap-2 px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Cadastrar Novo Profissional
        </Link>
      </div>

      <div className="flex justify-end pt-2">
        <button
          disabled={!selecionado}
          onClick={() => {
            const profissional = profissionais.find((p) => p.id === selecionado);
            if (profissional) onNext(selecionado, profissionalParaSnapshot(profissional));
          }}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
