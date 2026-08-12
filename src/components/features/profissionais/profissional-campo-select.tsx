"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { Profissional } from "@/lib/supabase/types";
import type { ProfissionalSnapshot } from "@/lib/profissionais/types";
import { profissionalParaSnapshot } from "@/lib/profissionais/snapshot";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface ProfissionalCampoSelectProps {
  profissionais: Profissional[];
  value?: string;
  label?: string;
  /** Para onde voltar depois de cadastrar um profissional novo a partir deste formulário (URL da própria página, com draft já persistido em localStorage). */
  redirectToNovoProfissional: string;
  onChange: (profissionalId: string, profissional: ProfissionalSnapshot | undefined) => void;
}

/** Campo compacto de seleção de Responsável Técnico — pra embutir dentro de um formulário maior de página única (sem um "step" próprio). */
export function ProfissionalCampoSelect({
  profissionais,
  value,
  label = "Responsável Técnico",
  redirectToNovoProfissional,
  onChange,
}: ProfissionalCampoSelectProps) {
  return (
    <div className="space-y-1.5">
      <label className={labelClass}>{label}</label>
      <div className="flex gap-2">
        <select
          className={inputClass}
          value={value ?? ""}
          onChange={(e) => {
            const profissional = profissionais.find((p) => p.id === e.target.value);
            onChange(e.target.value, profissional ? profissionalParaSnapshot(profissional) : undefined);
          }}
        >
          <option value="" className="bg-[#111625]">
            -- Selecione --
          </option>
          {profissionais.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#111625]">
              {p.nome} ({p.registro_tipo === "cft" ? "CFT" : "CREA/SC"} {p.registro_numero})
            </option>
          ))}
        </select>
        <Link
          href={`/profissionais/novo?redirectTo=${encodeURIComponent(redirectToNovoProfissional)}`}
          title="Cadastrar novo profissional"
          className="px-3 flex items-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold transition-all whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
