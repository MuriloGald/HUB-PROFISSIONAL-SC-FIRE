"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Question } from "./question";
import { PERGUNTAS_MAP } from "@/lib/laudos/constants";
import type { Respostas } from "@/lib/laudos/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

const TOTAL_STEPS = 4;

interface FormsMedioProps {
  respostas: Respostas;
  onBack: (respostas: Respostas) => void;
  onNext: (respostas: Respostas) => void;
}

/** Questionário de evento de Médio Porte (Anexo C) — 4 sub-etapas. */
export function FormsMedio({ respostas: inicial, onBack, onNext }: FormsMedioProps) {
  const [subStep, setSubStep] = useState(1);
  const [respostas, setRespostas] = useState<Respostas>(inicial);

  function set(key: string, value: string) {
    setRespostas((r) => ({ ...r, [key]: value }));
  }

  function handleBack() {
    if (subStep > 1) setSubStep((s) => s - 1);
    else onBack(respostas);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (subStep < TOTAL_STEPS) setSubStep((s) => s + 1);
    else onNext(respostas);
  }

  const q = (key: string) => (
    <Question key={key} name={key} label={PERGUNTAS_MAP[key]} value={respostas[key]} onChange={(v) => set(key, v)} />
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="flex gap-1">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full ${subStep >= i ? "bg-red-500" : "bg-white/10"}`} />
        ))}
      </div>

      {subStep === 1 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">1/4 - Características Gerais</h4>
          {["CGMP01", "CGMP02", "CGMP03", "CGMP04"].map(q)}
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Estruturas provisórias</h4>
          {["EPMP01", "EPMP02", "EPMP03"].map(q)}
        </>
      )}

      {subStep === 2 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">2/4 - Estruturas Provisórias (Cont.)</h4>
          {["EPMP04", "EPMP05", "EPMP06", "EPMP07", "EPMP08"].map(q)}
        </>
      )}

      {subStep === 3 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">3/4 - SMSCI</h4>
          <Question name="SMSCIMP01" label="Haverá uso de GLP?" value={respostas.SMSCIMP01} onChange={(v) => set("SMSCIMP01", v)} />
          {respostas.SMSCIMP01 === "sim" && (
            <div className="space-y-1.5">
              <label className={labelClass}>Se sim, informe a quantidade (kg)</label>
              <input type="number" className={inputClass} value={respostas.GAS ?? ""} onChange={(e) => set("GAS", e.target.value)} />
            </div>
          )}
          {["SMSCIMP02", "SMSCIMP03", "SMSCIMP04", "SMSCIMP05", "SMSCIMP06", "SMSCIMP07", "SMSCIMP08"].map(q)}
        </>
      )}

      {subStep === 4 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">4/4 - SMSCI (Cont.), Equipamentos e Documentação</h4>
          {["SMSCIMP09", "SMSCIMP10", "SMSCIMP11", "SMSCIMP12", "SMSCIMP13"].map(q)}
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Equipamentos</h4>
          {q("DEA")}
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Documentação</h4>
          {q("DOCMP")}

          <div className="space-y-1.5">
            <label className={labelClass}>Observações</label>
            <textarea
              rows={3}
              className={inputClass}
              placeholder="Insira observações relevantes aqui..."
              value={respostas.OBS ?? ""}
              onChange={(e) => set("OBS", e.target.value)}
            />
          </div>

          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Responsável Técnico (RT)</h4>
          <div className="space-y-1.5">
            <label className={labelClass}>Selecione o RT que assinará o Laudo</label>
            <select
              required
              value={respostas.rt_selecionado ?? ""}
              onChange={(e) => set("rt_selecionado", e.target.value)}
              className={inputClass}
            >
              <option value="" className="bg-[#111625]">-- Selecione --</option>
              <option value="rt1" className="bg-[#111625]">Dione Borges</option>
              <option value="rt2" className="bg-[#111625]">Paulo Roberto Ramos</option>
            </select>
          </div>
        </>
      )}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          {subStep === TOTAL_STEPS ? (
            <>Revisar e Gerar PDF <Check className="w-3.5 h-3.5" /></>
          ) : (
            <>Próxima <ArrowRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>
    </form>
  );
}
