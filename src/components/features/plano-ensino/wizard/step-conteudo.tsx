"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarPlus, Plus, Trash2 } from "lucide-react";
import type { PlanoEnsinoWizardState, SubtemaPlano } from "@/lib/plano-ensino/types";

const inputClass =
  "px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";
const textareaClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all min-h-[90px] resize-y";

interface StepConteudoProps {
  state: PlanoEnsinoWizardState;
  onBack: () => void;
  onNext: (partial: Partial<PlanoEnsinoWizardState>) => void;
}

export function StepConteudo({ state, onBack, onNext }: StepConteudoProps) {
  const [conteudo, setConteudo] = useState<SubtemaPlano[]>((state.conteudo_programatico ?? []).map((l) => ({ dia: 1, ...l })));
  const [datasDias, setDatasDias] = useState<Record<number, string>>(state.datas_dias ?? {});
  const [metodologia, setMetodologia] = useState(state.metodologia ?? "");
  const [recursos, setRecursos] = useState(state.recursos_didaticos ?? "");

  function atualizarDataDia(dia: number, data: string) {
    setDatasDias((d) => ({ ...d, [dia]: data }));
  }

  const dias = useMemo(() => {
    const set = new Set(conteudo.map((c) => c.dia ?? 1));
    return [...set].sort((a, b) => a - b);
  }, [conteudo]);

  function atualizarLinha(index: number, campo: "nome" | "horas" | "dia", valor: string) {
    setConteudo((c) =>
      c.map((l, idx) => (idx === index ? { ...l, [campo]: campo === "nome" ? valor : Number(valor) || 0 } : l))
    );
  }

  function removerLinha(index: number) {
    setConteudo((c) => c.filter((_, idx) => idx !== index));
  }

  function adicionarLinha(dia: number) {
    setConteudo((c) => [...c, { subtheme_id: `custom-${Date.now()}`, nome: "", horas: 0, sort_order: c.length, dia }]);
  }

  function adicionarDia() {
    const proximoDia = dias.length > 0 ? Math.max(...dias) + 1 : 1;
    adicionarLinha(proximoDia);
  }

  function removerDia(dia: number) {
    if (!confirm(`Remover o Dia ${dia} e todos os tópicos associados?`)) return;
    setConteudo((c) => c.filter((l) => (l.dia ?? 1) !== dia));
    setDatasDias((d) => {
      const next = { ...d };
      delete next[dia];
      return next;
    });
  }

  const cargaTotal = conteudo.reduce((sum, l) => sum + (l.horas || 0), 0);

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">Conteúdo Programático</h3>
          <p className="text-xs text-gray-500 mt-1">Organize os tópicos por dia — ajuste as horas ou adicione tópicos/dias extras.</p>
        </div>
        <span className="px-3 py-1.5 text-xs font-bold text-gray-300 bg-white/[0.04] border border-white/[0.08] rounded-full flex-shrink-0">
          Carga total: {cargaTotal}h
        </span>
      </div>

      <div className="space-y-4">
        {dias.length === 0 && <p className="text-xs text-gray-500">Nenhum tópico ainda — clique em &quot;Adicionar Dia&quot; para começar.</p>}

        {dias.map((dia) => {
          const linhasDoDia = conteudo.map((l, idx) => ({ ...l, idx })).filter((l) => (l.dia ?? 1) === dia);
          const cargaDia = linhasDoDia.reduce((sum, l) => sum + (l.horas || 0), 0);

          return (
            <div key={dia} className="rounded-xl bg-black/20 border border-white/[0.08] p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-red-400">Dia {dia}</h4>
                  <input
                    type="date"
                    value={datasDias[dia] ?? ""}
                    onChange={(e) => atualizarDataDia(dia, e.target.value)}
                    title="Data prevista deste dia"
                    className={`${inputClass} py-1.5`}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{cargaDia}h</span>
                  <button
                    type="button"
                    onClick={() => removerDia(dia)}
                    title="Remover dia"
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {linhasDoDia.map((linha) => (
                  <div key={linha.idx} className="flex items-center gap-2">
                    <input
                      value={linha.nome}
                      onChange={(e) => atualizarLinha(linha.idx, "nome", e.target.value)}
                      placeholder="Tópico"
                      className={`${inputClass} flex-1`}
                    />
                    <input
                      type="number"
                      min={0}
                      value={linha.horas}
                      onChange={(e) => atualizarLinha(linha.idx, "horas", e.target.value)}
                      title="Horas"
                      className={`${inputClass} w-20`}
                    />
                    <button
                      type="button"
                      onClick={() => removerLinha(linha.idx)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => adicionarLinha(dia)}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Tópico
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={adicionarDia}
          className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-white/[0.15] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 text-xs font-semibold rounded-lg transition-all"
        >
          <CalendarPlus className="w-3.5 h-3.5" /> Adicionar Dia
        </button>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Metodologia de Ensino</label>
        <textarea value={metodologia} onChange={(e) => setMetodologia(e.target.value)} className={textareaClass} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Recursos Didáticos</label>
        <textarea value={recursos} onChange={(e) => setRecursos(e.target.value)} className={textareaClass} />
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          type="button"
          onClick={() => onNext({ conteudo_programatico: conteudo, datas_dias: datasDias, metodologia, recursos_didaticos: recursos })}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
