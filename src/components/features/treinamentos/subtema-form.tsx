"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { atualizarSubtema, criarSubtema } from "@/app/actions/subtemas";
import { CATEGORIAS_SUBTEMA, NIVEIS_CURSO } from "@/lib/treinador/constants";

interface SubtemaExistente {
  id: string;
  name: string;
  category: string;
  level: string;
  hours: number;
  description: string | null;
  canva_embed: string | null;
}

interface SubtemaFormProps {
  cursos: { id: string; name: string }[];
  subtemaExistente?: SubtemaExistente;
  cursoPreselecionado?: string;
}

export function SubtemaForm({ cursos, subtemaExistente, cursoPreselecionado }: SubtemaFormProps) {
  const router = useRouter();
  const modoEdicao = Boolean(subtemaExistente);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const [name, setName] = useState(subtemaExistente?.name ?? "");
  const [category, setCategory] = useState<string>(subtemaExistente?.category ?? CATEGORIAS_SUBTEMA[0]);
  const [level, setLevel] = useState<string>(subtemaExistente?.level ?? NIVEIS_CURSO[0]);
  const [hours, setHours] = useState(String(subtemaExistente?.hours ?? 1));
  const [description, setDescription] = useState(subtemaExistente?.description ?? "");
  const [canvaEmbed, setCanvaEmbed] = useState(subtemaExistente?.canva_embed ?? "");
  const [trainingId, setTrainingId] = useState(cursoPreselecionado ?? "");
  const [sortOrder, setSortOrder] = useState("0");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!name.trim()) {
      setErro("Informe o nome do subtema.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        category,
        level,
        hours: parseFloat(hours.replace(",", ".")) || 0,
        description: description.trim(),
        canvaEmbed: canvaEmbed.trim(),
      };

      const res = modoEdicao
        ? await atualizarSubtema(subtemaExistente!.id, payload)
        : await criarSubtema({ ...payload, trainingId: trainingId || null, sortOrder: trainingId ? parseInt(sortOrder, 10) || 0 : null });

      if (res.error) {
        setErro(res.error);
        return;
      }

      router.push(trainingId ? `/treinamentos/cursos/${trainingId}` : "/treinamentos/subtemas");
      router.refresh();
    });
  }

  const inputClass =
    "w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-400 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
      <div>
        <label className={labelClass}>Nome do subtema</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: B0 — Apresentação do Curso" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Módulo</label>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIAS_SUBTEMA.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Nível</label>
          <select className={inputClass} value={level} onChange={(e) => setLevel(e.target.value)}>
            {NIVEIS_CURSO.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Carga horária (h)</label>
        <input className={inputClass} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Ex: 0.5" />
      </div>

      <div>
        <label className={labelClass}>Descrição (opcional)</label>
        <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Link de embed do Canva (opcional)</label>
        <input
          className={inputClass}
          value={canvaEmbed}
          onChange={(e) => setCanvaEmbed(e.target.value)}
          placeholder="https://www.canva.com/design/.../view?embed"
        />
        <p className="text-[11px] text-gray-500 mt-1">No Canva: Compartilhar → Mais → Incorporar → copiar o link (não o &lt;iframe&gt; inteiro).</p>
      </div>

      {!modoEdicao && (
        <div className="pt-4 border-t border-white/[0.06] space-y-4">
          <div>
            <label className={labelClass}>Vincular a um curso (opcional)</label>
            <select className={inputClass} value={trainingId} onChange={(e) => setTrainingId(e.target.value)}>
              <option value="">Não vincular agora</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {trainingId && (
            <div>
              <label className={labelClass}>Posição no currículo (sort_order — 0 = primeira aula)</label>
              <input className={inputClass} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
          )}
        </div>
      )}

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {pending ? "Salvando..." : modoEdicao ? "Salvar Alterações" : "Salvar Subtema"}
      </button>
    </form>
  );
}
