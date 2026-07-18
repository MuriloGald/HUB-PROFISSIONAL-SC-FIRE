"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "../image-uploader";
import type { Cenario, Subsecao } from "@/lib/save-in23/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

const INCISOS_ART6 = [
  { value: "I", label: "Inciso I — local externo/descoberto" },
  { value: "II", label: "Inciso II — detecção + ventilação/extração + sprinkler" },
  { value: "III", label: "Inciso III — preexistente + compartimentação + detecção" },
  { value: "IV-a", label: "Inciso IV, a — área ≤ 1.500 m² + ventilação + detecção" },
  { value: "IV-b", label: "Inciso IV, b — pavimento ≤ 500 m² + ventilação ou compartimentação" },
];

function novaSubsecao(): Subsecao {
  return { id: crypto.randomUUID(), titulo: "", corpo: "", imagens: [] };
}

function novoCenario(): Cenario {
  return { id: crypto.randomUUID(), titulo: "", fundamentacao: "", introducao: "", subsecoes: [novaSubsecao()] };
}

interface StepCapitulo3Props {
  cenarios: Cenario[];
  onBack: () => void;
  onNext: (cenarios: Cenario[]) => void;
}

export function StepCapitulo3({ cenarios: cenariosIniciais, onBack, onNext }: StepCapitulo3Props) {
  const [cenarios, setCenarios] = useState<Cenario[]>(cenariosIniciais.length ? cenariosIniciais : [novoCenario()]);

  function updateCenario(id: string, patch: Partial<Cenario>) {
    setCenarios((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function removeCenario(id: string) {
    setCenarios((cs) => cs.filter((c) => c.id !== id));
  }
  function addSubsecao(cenarioId: string) {
    setCenarios((cs) => cs.map((c) => (c.id === cenarioId ? { ...c, subsecoes: [...c.subsecoes, novaSubsecao()] } : c)));
  }
  function updateSubsecao(cenarioId: string, subId: string, patch: Partial<Subsecao>) {
    setCenarios((cs) =>
      cs.map((c) =>
        c.id === cenarioId ? { ...c, subsecoes: c.subsecoes.map((s) => (s.id === subId ? { ...s, ...patch } : s)) } : c
      )
    );
  }
  function removeSubsecao(cenarioId: string, subId: string) {
    setCenarios((cs) => cs.map((c) => (c.id === cenarioId ? { ...c, subsecoes: c.subsecoes.filter((s) => s.id !== subId) } : c)));
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6">
        <h3 className="text-lg font-bold text-white">Cenários — Enquadramento no Art. 6º</h3>
        <p className="text-xs text-gray-400 mt-1">
          Cada cenário vira um capítulo numerado no laudo (3, 4, 5...), na ordem abaixo — a Conclusão fica no número seguinte ao último cenário.
        </p>
      </div>

      {cenarios.map((cen, cenIndex) => {
        const capNum = cenIndex + 3;
        return (
        <div key={cen.id} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-gray-500 flex-shrink-0">{capNum}.</span>
            <input
              value={cen.titulo}
              onChange={(e) => updateCenario(cen.id, { titulo: e.target.value })}
              placeholder={`Cenário 0${cenIndex + 1}: Instalação Interna...`}
              className="flex-1 px-3 py-2 text-sm font-semibold text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500"
            />
            <button type="button" onClick={() => removeCenario(cen.id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Fundamentação (inciso do Art. 6º)</label>
            <select
              value={cen.fundamentacao ?? ""}
              onChange={(e) => updateCenario(cen.id, { fundamentacao: e.target.value })}
              className={inputClass}
            >
              <option value="" className="bg-[#111625]">
                --
              </option>
              {INCISOS_ART6.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#111625]">
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Introdução do cenário</label>
            <textarea
              rows={3}
              className={inputClass}
              placeholder={`Ex.: Este cenário baseia-se no Artigo 6º, Inciso ${cen.fundamentacao || "..."}, da IN 23, que permite a dispensa de PBD mediante...`}
              value={cen.introducao ?? ""}
              onChange={(e) => updateCenario(cen.id, { introducao: e.target.value })}
            />
          </div>

          <div className="space-y-3 pl-3 border-l-2 border-white/[0.08]">
            {cen.subsecoes.map((sub, subIndex) => {
              return (
                <div key={sub.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 flex-shrink-0">{capNum}.{subIndex + 1}</span>
                    <input
                      value={sub.titulo}
                      onChange={(e) => updateSubsecao(cen.id, sub.id, { titulo: e.target.value })}
                      placeholder="Título da subseção (ex.: Pilotis)"
                      className="flex-1 px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500"
                    />
                    <button type="button" onClick={() => removeSubsecao(cen.id, sub.id)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    className={inputClass}
                    placeholder="Texto da subseção… (linha em branco = novo parágrafo, '- item' = lista)"
                    value={sub.corpo}
                    onChange={(e) => updateSubsecao(cen.id, sub.id, { corpo: e.target.value })}
                  />
                  <ImageUploader imagens={sub.imagens} onChange={(imagens) => updateSubsecao(cen.id, sub.id, { imagens })} />
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => addSubsecao(cen.id)}
              className="text-xs font-semibold text-gray-400 hover:text-red-400 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar subseção
            </button>
          </div>
        </div>
        );
      })}

      <button
        type="button"
        onClick={() => setCenarios((cs) => [...cs, novoCenario()])}
        className="w-full py-3 border border-dashed border-white/[0.15] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Adicionar cenário
      </button>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-white/[0.08] hover:border-white/20 text-gray-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          onClick={() => onNext(cenarios)}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
