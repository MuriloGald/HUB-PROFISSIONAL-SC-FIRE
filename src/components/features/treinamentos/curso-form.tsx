"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarCurso } from "@/app/actions/subtemas";

const COMBO_TYPES: { value: string; label: string }[] = [
  { value: "basica", label: "Básico" },
  { value: "intermediaria", label: "Intermediário" },
  { value: "avancada", label: "Avançado" },
  { value: "lei-lucas", label: "Lei Lucas" },
  { value: "customizado", label: "Customizado / Reciclagem" },
];

export function CursoForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalHours, setTotalHours] = useState("16");
  const [comboType, setComboType] = useState("intermediaria");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!name.trim()) {
      setErro("Informe o nome do curso.");
      return;
    }

    startTransition(async () => {
      const res = await criarCurso({
        name: name.trim(),
        description: description.trim(),
        totalHours: parseFloat(totalHours.replace(",", ".")) || 0,
        comboType,
      });

      if (res.error) {
        setErro(res.error);
        return;
      }

      router.push(`/treinamentos/cursos/${res.data!.id}`);
      router.refresh();
    });
  }

  const inputClass =
    "w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-400 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
      <div>
        <label className={labelClass}>Nome do curso</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Curso Intermediário — Brigada de Incêndio (IN 28/2024)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nível</label>
          <select className={inputClass} value={comboType} onChange={(e) => setComboType(e.target.value)}>
            {COMBO_TYPES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Carga horária total (h)</label>
          <input className={inputClass} value={totalHours} onChange={(e) => setTotalHours(e.target.value)} placeholder="Ex: 16" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Descrição (opcional)</label>
        <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {pending ? "Criando..." : "Criar Curso"}
      </button>
      <p className="text-[11px] text-gray-500 text-center">Depois de criar, você adiciona os subtemas e define a ordem na tela do curso.</p>
    </form>
  );
}
