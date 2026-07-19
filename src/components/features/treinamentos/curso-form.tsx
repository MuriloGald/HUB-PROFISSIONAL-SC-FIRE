"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { atualizarCurso, criarCurso } from "@/app/actions/subtemas";
import type { CursoTemplate } from "@/app/actions/subtemas";
import { ListaEditavel } from "@/components/features/plano-ensino/wizard/lista-editavel";

const COMBO_TYPES: { value: string; label: string }[] = [
  { value: "basica", label: "Básico" },
  { value: "intermediaria", label: "Intermediário" },
  { value: "avancada", label: "Avançado" },
  { value: "lei-lucas", label: "Lei Lucas" },
  { value: "customizado", label: "Customizado / Reciclagem" },
];

interface CursoFormProps {
  cursoExistente?: CursoTemplate;
}

export function CursoForm({ cursoExistente }: CursoFormProps) {
  const router = useRouter();
  const modoEdicao = Boolean(cursoExistente);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const [name, setName] = useState(cursoExistente?.name ?? "");
  const [description, setDescription] = useState(cursoExistente?.description ?? "");
  const [totalHours, setTotalHours] = useState(String(cursoExistente?.total_hours ?? 16));
  const [comboType, setComboType] = useState(cursoExistente?.combo_type ?? "intermediaria");

  const [ementa, setEmenta] = useState(cursoExistente?.ementa ?? "");
  const [objetivoGeral, setObjetivoGeral] = useState(cursoExistente?.objetivo_geral ?? "");
  const [objetivosEspecificos, setObjetivosEspecificos] = useState<string[]>(cursoExistente?.objetivos_especificos ?? []);
  const [metodologia, setMetodologia] = useState(cursoExistente?.metodologia ?? "");
  const [recursosDidaticos, setRecursosDidaticos] = useState(cursoExistente?.recursos_didaticos ?? "");
  const [criteriosAvaliacao, setCriteriosAvaliacao] = useState(cursoExistente?.criterios_avaliacao ?? "");
  const [bibliografiaBasica, setBibliografiaBasica] = useState<string[]>(cursoExistente?.bibliografia_basica ?? []);
  const [bibliografiaComplementar, setBibliografiaComplementar] = useState<string[]>(cursoExistente?.bibliografia_complementar ?? []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!name.trim()) {
      setErro("Informe o nome do curso.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        totalHours: parseFloat(totalHours.replace(",", ".")) || 0,
        comboType,
        ementa: ementa.trim(),
        objetivoGeral: objetivoGeral.trim(),
        objetivosEspecificos,
        metodologia: metodologia.trim(),
        recursosDidaticos: recursosDidaticos.trim(),
        criteriosAvaliacao: criteriosAvaliacao.trim(),
        bibliografiaBasica,
        bibliografiaComplementar,
      };

      const res = modoEdicao ? await atualizarCurso(cursoExistente!.id, payload) : await criarCurso(payload);

      if (res.error) {
        setErro(res.error);
        return;
      }

      const id = modoEdicao ? cursoExistente!.id : (res as { data?: { id: string } }).data?.id;
      router.push(`/treinamentos/cursos/${id}`);
      router.refresh();
    });
  }

  const inputClass =
    "w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-400 mb-1.5";
  const sectionTitleClass = "text-sm font-bold text-white pt-4 border-t border-white/[0.06]";
  const hintClass = "text-[11px] text-gray-500 -mt-1 mb-2";

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

      <h3 className={sectionTitleClass}>Template do Plano de Ensino</h3>
      <p className={hintClass}>
        Preenchido aqui uma vez, esses campos vêm prontos sempre que alguém gerar um Plano de Ensino pra este curso — não precisa
        redigitar a cada turma.
      </p>

      <div>
        <label className={labelClass}>Ementa</label>
        <textarea className={inputClass} rows={5} value={ementa} onChange={(e) => setEmenta(e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Objetivo Geral</label>
        <textarea className={inputClass} rows={3} value={objetivoGeral} onChange={(e) => setObjetivoGeral(e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Objetivos Específicos</label>
        <ListaEditavel itens={objetivosEspecificos} onChange={setObjetivosEspecificos} placeholder="Adicionar objetivo específico..." />
      </div>

      <div>
        <label className={labelClass}>Metodologia de Ensino</label>
        <textarea className={inputClass} rows={2} value={metodologia} onChange={(e) => setMetodologia(e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Recursos Didáticos</label>
        <textarea className={inputClass} rows={2} value={recursosDidaticos} onChange={(e) => setRecursosDidaticos(e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Critérios de Avaliação</label>
        <textarea className={inputClass} rows={2} value={criteriosAvaliacao} onChange={(e) => setCriteriosAvaliacao(e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Bibliografia Básica</label>
        <ListaEditavel itens={bibliografiaBasica} onChange={setBibliografiaBasica} placeholder="Adicionar referência básica..." />
      </div>

      <div>
        <label className={labelClass}>Bibliografia Complementar</label>
        <ListaEditavel itens={bibliografiaComplementar} onChange={setBibliografiaComplementar} placeholder="Adicionar referência complementar..." />
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {pending ? "Salvando..." : modoEdicao ? "Salvar Alterações" : "Criar Curso"}
      </button>
      {!modoEdicao && <p className="text-[11px] text-gray-500 text-center">Depois de criar, você adiciona os subtemas e define a ordem na tela do curso.</p>}
    </form>
  );
}
