"use client";

import { OPCOES_RESPOSTA } from "@/lib/laudos/constants";

interface QuestionProps {
  name: string;
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options?: { value: string; label: string }[];
  required?: boolean;
}

/** Pergunta Sim/Não/Não se aplica — usada nos questionários de pequeno/médio/grande porte. */
export function Question({ name, label, value, onChange, options = OPCOES_RESPOSTA, required = true }: QuestionProps) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3">
      <div className="text-sm text-gray-300">{label}</div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              required={required}
              className="accent-red-500"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
