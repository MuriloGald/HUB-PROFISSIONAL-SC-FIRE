"use client";

import { useState } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import type { HistoricoItem, LaudoTecnicoWizardState } from "@/lib/save-in23/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface StepProps {
  state: LaudoTecnicoWizardState;
  onNext: (partial: Partial<LaudoTecnicoWizardState>) => void;
}

export function StepIdentificacaoCap1({ state, onNext }: StepProps) {
  const [tituloDocumento, setTituloDocumento] = useState(state.tituloDocumento ?? "");
  const [subtitulo, setSubtitulo] = useState(state.subtitulo ?? "");
  const [propriedade, setPropriedade] = useState(state.propriedade ?? "");
  const [revisao, setRevisao] = useState(state.revisao ?? "REV00");
  const [respTecnico, setRespTecnico] = useState(state.respTecnico ?? "");

  const [areaConstruida, setAreaConstruida] = useState(state.capitulo1.areaConstruida ?? state.cliente?.area_construida ?? "");
  const [pavimentos, setPavimentos] = useState(state.capitulo1.pavimentos ?? state.cliente?.pavimentos ?? "");
  const [altura, setAltura] = useState(state.capitulo1.altura ?? state.cliente?.altura ?? "");
  const [validadeAtestado, setValidadeAtestado] = useState(state.capitulo1.validadeAtestado ?? state.cliente?.validade_atestado ?? "");
  const [textoIntro, setTextoIntro] = useState(state.capitulo1.textoIntro ?? "");
  const [historico, setHistorico] = useState<HistoricoItem[]>(state.capitulo1.historico);
  const [notaObservacao, setNotaObservacao] = useState(state.capitulo1.notaObservacao ?? "");

  function addHistorico() {
    setHistorico((h) => [...h, { id: crypto.randomUUID(), tituloData: "", descricao: "" }]);
  }
  function updateHistorico(id: string, patch: Partial<HistoricoItem>) {
    setHistorico((h) => h.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }
  function removeHistorico(id: string) {
    setHistorico((h) => h.filter((item) => item.id !== id));
  }

  function handleAvancar() {
    onNext({
      tituloDocumento,
      subtitulo,
      propriedade,
      revisao,
      respTecnico,
      capitulo1: { areaConstruida, pavimentos, altura, validadeAtestado, textoIntro, historico, notaObservacao },
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Identificação do laudo</h3>
        <div className="space-y-1.5">
          <label className={labelClass}>Título do documento</label>
          <input
            className={inputClass}
            placeholder="LAUDO TÉCNICO DE CONFORMIDADE – IMPLANTAÇÃO DE SAVE (IN 23/CBMSC)"
            value={tituloDocumento}
            onChange={(e) => setTituloDocumento(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Subtítulo</label>
          <input
            className={inputClass}
            placeholder="Regularização do Sistema de Alimentação para Veículos Elétricos via dispensa de PBD"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Propriedade</label>
            <input className={inputClass} value={propriedade} onChange={(e) => setPropriedade(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Revisão</label>
            <input className={inputClass} placeholder="REV00" value={revisao} onChange={(e) => setRevisao(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Responsável Técnico</label>
          <input
            className={inputClass}
            placeholder="Eng.ª Dione Borges — CREA-SC 177797-2"
            value={respTecnico}
            onChange={(e) => setRespTecnico(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">1. Informações do Condomínio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Área construída (m²)</label>
            <input type="number" step="0.01" className={inputClass} value={areaConstruida} onChange={(e) => setAreaConstruida(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Nº de pavimentos</label>
            <input type="number" className={inputClass} value={pavimentos} onChange={(e) => setPavimentos(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Altura total (m)</label>
            <input type="number" step="0.01" className={inputClass} value={altura} onChange={(e) => setAltura(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Validade do atestado</label>
            <input type="date" className={inputClass} value={validadeAtestado} onChange={(e) => setValidadeAtestado(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Texto introdutório</label>
          <textarea
            rows={4}
            className={inputClass}
            placeholder="Ex.: O Edifício Multifamiliar [nome] é uma edificação de Alta Complexidade..."
            value={textoIntro}
            onChange={(e) => setTextoIntro(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className={labelClass}>Histórico de alterações de projeto</label>
          {historico.map((h) => (
            <div key={h.id} className="rounded-xl border border-white/[0.08] p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="Data e referência (ex.: 25 de janeiro de 2019 - Subsolo)"
                  value={h.tituloData}
                  onChange={(e) => updateHistorico(h.id, { tituloData: e.target.value })}
                />
                <button type="button" onClick={() => removeHistorico(h.id)} className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={2}
                className={inputClass}
                placeholder="Descrição da alteração de projeto…"
                value={h.descricao}
                onChange={(e) => updateHistorico(h.id, { descricao: e.target.value })}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addHistorico}
            className="w-full py-2 border border-dashed border-white/[0.15] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar item ao histórico de alterações
          </button>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Nota de Observação</label>
          <textarea
            rows={3}
            className={inputClass}
            placeholder="Ex.: Ressalta-se que a edificação possui solicitações de habite-se em aberto..."
            value={notaObservacao}
            onChange={(e) => setNotaObservacao(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleAvancar}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
