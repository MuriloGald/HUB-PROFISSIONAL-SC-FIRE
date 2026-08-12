"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { Question } from "./question";
import { PERGUNTAS_MAP } from "@/lib/laudos/constants";
import { ProfissionalCampoSelect } from "@/components/features/profissionais/profissional-campo-select";
import { formatarRegistroProfissional } from "@/lib/shared/pdf-branding";
import type { LocalSaida, Respostas } from "@/lib/laudos/types";
import type { Profissional } from "@/lib/supabase/types";
import type { ProfissionalSnapshot } from "@/lib/profissionais/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

const TOTAL_STEPS = 9;

function parseLocais(json: string | undefined): LocalSaida[] {
  try {
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

const LOCAL_VAZIO: LocalSaida = { nome: "", boate: "Não", carac: "", publico: "", area: "", distancia: "", qtd: "", largura: "" };

interface FormsGrandeProps {
  respostas: Respostas;
  profissionais: Profissional[];
  onBack: (respostas: Respostas) => void;
  onNext: (respostas: Respostas) => void;
}

/** Questionário de evento de Grande Porte (Anexo D + Anexo E) — 9 sub-etapas. */
export function FormsGrande({ respostas: inicial, profissionais, onBack, onNext }: FormsGrandeProps) {
  const [subStep, setSubStep] = useState(1);
  const [respostas, setRespostas] = useState<Respostas>(inicial);
  const [locais, setLocais] = useState<LocalSaida[]>(() => parseLocais(inicial.locais));

  function set(key: string, value: string) {
    setRespostas((r) => ({ ...r, [key]: value }));
  }

  function setRt(profissionalId: string, p: ProfissionalSnapshot | undefined) {
    setRespostas((r) => ({
      ...r,
      rt_selecionado: profissionalId,
      rt_nome: p?.nome ?? "",
      rt_cpf: p?.cpf ?? "",
      rt_telefone: p?.telefone ?? "",
      rt_email: p?.email ?? "",
      rt_registro: p ? formatarRegistroProfissional({ nome: p.nome, registroTipo: p.registro_tipo, registroNumero: p.registro_numero }) : "",
    }));
  }

  function respostasComLocais(): Respostas {
    return { ...respostas, locais: JSON.stringify(locais) };
  }

  function handleBack() {
    if (subStep > 1) {
      setSubStep((s) => s - 1);
    } else {
      onBack(respostasComLocais());
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (subStep < TOTAL_STEPS) setSubStep((s) => s + 1);
    else onNext(respostasComLocais());
  }

  function updateLocal(index: number, field: keyof LocalSaida, value: string) {
    setLocais((arr) => arr.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
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
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">1/9 - Características Gerais</h4>
          {["CGGP01", "CGGP02", "CGGP03"].map(q)}
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Estruturas provisórias</h4>
          {["PROVISORIAGP01", "PROVISORIAGP02", "PROVISORIAGP03", "PROVISORIAGP04", "PROVISORIAGP05", "PROVISORIAGP06", "PROVISORIAGP07", "PROVISORIAGP08"].map(q)}
        </>
      )}

      {subStep === 2 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">2/9 - Instalações de Gás e Extintores</h4>
          <Question name="GLPGP01" label="Haverá uso de GLP?" value={respostas.GLPGP01} onChange={(v) => set("GLPGP01", v)} />
          {respostas.GLPGP01 === "sim" && (
            <div className="space-y-1.5">
              <label className={labelClass}>Se sim, informe a quantidade (kg)</label>
              <input type="number" className={inputClass} value={respostas.GAS ?? ""} onChange={(e) => set("GAS", e.target.value)} />
            </div>
          )}
          {["GLPGP02", "GLPGP03"].map(q)}

          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Sistema Preventivo por Extintores</h4>
          {q("EXTGP1")}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Qtd. extintores portáteis</label>
              <input required type="number" className={inputClass} value={respostas.EXTGP02_QTD ?? ""} onChange={(e) => set("EXTGP02_QTD", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Qtd. extintores sobrerrodas</label>
              <input required type="number" className={inputClass} value={respostas.EXTGP03_QTD ?? ""} onChange={(e) => set("EXTGP03_QTD", e.target.value)} />
            </div>
          </div>
        </>
      )}

      {subStep === 3 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">3/9 - Saídas de Emergência (Parte 1)</h4>
          {q("SEGP01")}
          <div className="space-y-1.5">
            <label className={labelClass}>Qtd. de estruturas com delimitação de área e ambientes fechados</label>
            <input required type="number" className={inputClass} value={respostas.AMBFEC ?? ""} onChange={(e) => set("AMBFEC", e.target.value)} />
          </div>
          {["SEGP03", "SEGP04", "SEGP05", "SEGP06", "SEGP07"].map(q)}
        </>
      )}

      {subStep === 4 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">4/9 - Saídas de Emergência (Parte 2)</h4>
          {["SEGP08", "SEGP09", "SEGP10", "SEGP11"].map(q)}
          <Question
            name="CONTROLE"
            label="Foi previsto controle de lotação de público?"
            value={respostas.CONTROLE}
            onChange={(v) => set("CONTROLE", v)}
            options={[
              { value: "manual_auto", label: "Manual ou automatizado" },
              { value: "automatizado", label: "Automatizado (locais cobertos/fechados >1.000 pessoas)" },
              { value: "na", label: "Não se aplica" },
            ]}
          />
          {q("SEGP12")}
        </>
      )}

      {subStep === 5 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">5/9 - Saídas de Emergência (Parte 3) e Iluminação</h4>
          {["SEGP13", "SEGP14"].map(q)}
          {q("SEGP15")}
          {respostas.SEGP15 === "sim" && (
            <div className="space-y-1.5">
              <label className={labelClass}>Inclinação máxima das rampas (%)</label>
              <input type="number" className={inputClass} value={respostas.INCRAMP ?? ""} onChange={(e) => set("INCRAMP", e.target.value)} />
            </div>
          )}
          {["SEGP16", "SEGP17"].map(q)}

          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Sistema de Iluminação de Emergência</h4>
          {["SIEGP01", "SIEGP02", "SIEGP03"].map(q)}
          <div className="space-y-1.5">
            <label className={labelClass}>Qtd. total de luminárias previstas</label>
            <input required type="number" className={inputClass} value={respostas.LUM ?? ""} onChange={(e) => set("LUM", e.target.value)} />
          </div>
        </>
      )}

      {subStep === 6 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">6/9 - Sinalização, Demais Normativas e Brigadistas</h4>
          {["SALGP01", "SALGP02"].map(q)}
          {q("SALGP03")}
          {respostas.SALGP03 === "sim" && (
            <div className="space-y-1.5">
              <label className={labelClass}>Quantidade de placas</label>
              <input type="number" className={inputClass} value={respostas.PLACA ?? ""} onChange={(e) => set("PLACA", e.target.value)} />
            </div>
          )}
          {["SALGP04", "SALGP05", "DEMAISGP01", "DEMAISGP02", "DEMAISGP03"].map(q)}
          {q("DEMAISGP04")}
          {respostas.DEMAISGP04 === "sim" && (
            <div className="space-y-1.5">
              <label className={labelClass}>Quantidade de brigadistas</label>
              <input type="number" className={inputClass} value={respostas.BRIG ?? ""} onChange={(e) => set("BRIG", e.target.value)} />
            </div>
          )}
        </>
      )}

      {subStep === 7 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">7/9 - Demais Normativas, Equipamentos e Documentação</h4>
          {["DEMAISGP05", "DEMAISGP06", "DEMAISGP07"].map(q)}
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Equipamentos</h4>
          {q("EQUIPSGP")}
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Documentação</h4>
          {q("DOCGP")}

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
          <ProfissionalCampoSelect
            profissionais={profissionais}
            value={respostas.rt_selecionado}
            label="Selecione o RT que assinará o Laudo"
            redirectToNovoProfissional="/laudos/eventos/novo"
            onChange={setRt}
          />
        </>
      )}

      {subStep === 8 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">8/9 - Tabela de Dimensionamento das Saídas de Emergência</h4>
          <p className="text-xs text-gray-400">Preencha com os locais do evento conforme o Item 3 do Memorial Técnico (Anexo D).</p>

          <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
            <table className="w-full text-xs min-w-[900px]">
              <thead className="bg-white/[0.04] text-gray-400">
                <tr>
                  <th className="p-2 text-left">Nome do Local</th>
                  <th className="p-2 text-left">Boate/Show</th>
                  <th className="p-2 text-left">Características</th>
                  <th className="p-2 text-left w-20">Público</th>
                  <th className="p-2 text-left w-20">Área (m²)</th>
                  <th className="p-2 text-left w-24">Dist. Máx (m)</th>
                  <th className="p-2 text-left w-20">Qtd. Saídas</th>
                  <th className="p-2 text-left w-24">Largura (m)</th>
                  <th className="p-2 text-left w-10" />
                </tr>
              </thead>
              <tbody>
                {locais.map((local, index) => (
                  <tr key={index} className="border-t border-white/[0.06]">
                    <td className="p-1"><input className={inputClass} value={local.nome} onChange={(e) => updateLocal(index, "nome", e.target.value)} /></td>
                    <td className="p-1">
                      <select className={inputClass} value={local.boate} onChange={(e) => updateLocal(index, "boate", e.target.value)}>
                        <option value="Não" className="bg-[#111625]">Não</option>
                        <option value="Sim" className="bg-[#111625]">Sim</option>
                      </select>
                    </td>
                    <td className="p-1"><input className={inputClass} placeholder="Ex: estrutura coberta" value={local.carac} onChange={(e) => updateLocal(index, "carac", e.target.value)} /></td>
                    <td className="p-1"><input type="number" className={inputClass} value={local.publico} onChange={(e) => updateLocal(index, "publico", e.target.value)} /></td>
                    <td className="p-1"><input className={inputClass} value={local.area} onChange={(e) => updateLocal(index, "area", e.target.value)} /></td>
                    <td className="p-1"><input type="number" className={inputClass} value={local.distancia} onChange={(e) => updateLocal(index, "distancia", e.target.value)} /></td>
                    <td className="p-1"><input type="number" className={inputClass} value={local.qtd} onChange={(e) => updateLocal(index, "qtd", e.target.value)} /></td>
                    <td className="p-1"><input className={inputClass} value={local.largura} onChange={(e) => updateLocal(index, "largura", e.target.value)} /></td>
                    <td className="p-1 text-center">
                      <button type="button" onClick={() => setLocais((arr) => arr.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => setLocais((arr) => [...arr, { ...LOCAL_VAZIO }])}
            className="px-3 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Local
          </button>
        </>
      )}

      {subStep === 9 && (
        <>
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">9/9 - Laudo de Comissionamento (Anexo E)</h4>
          <p className="text-xs text-gray-400">Estas perguntas atestam que os itens já foram instalados e conferidos no local do evento.</p>
          {["LADOC", "LASE", "LASIE", "LASAL", "LADE1", "LADE2"].map(q)}

          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Prevenção em Espetáculos Pirotécnicos</h4>
          <Question
            name="TEM_PIRO"
            label="Haverá Espetáculo Pirotécnico?"
            value={respostas.TEM_PIRO}
            onChange={(v) => set("TEM_PIRO", v)}
            options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
          />
          {respostas.TEM_PIRO === "sim" && ["LAPIRO1", "LAPIRO2", "LAPIRO3", "LAPIRO4", "LAPIRO5"].map(q)}
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
