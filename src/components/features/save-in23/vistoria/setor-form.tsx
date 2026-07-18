"use client";

import { Trash2 } from "lucide-react";
import { avaliarSetor, sugerirAlteracoes } from "@/lib/save-in23/classificador";
import { OCUPACOES_ART6_OPCOES, PERGUNTAS_SETOR } from "@/lib/save-in23/constants";
import { ImageUploader } from "../image-uploader";
import type { Possibilidade, SetorVistoria } from "@/lib/save-in23/types";

function BoolToggle({ value, onChange }: { value: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {[
        { value: true, label: "Sim" },
        { value: false, label: "Não" },
      ].map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            value === opt.value ? "bg-red-500/10 border-red-500/50 text-red-400" : "border-white/[0.08] text-gray-400 hover:border-white/20"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function PossibilidadeToggle({ value, onChange }: { value: Possibilidade | undefined; onChange: (v: Possibilidade) => void }) {
  const opcoes: { value: Possibilidade; label: string }[] = [
    { value: true, label: "Sim" },
    { value: false, label: "Não" },
    { value: "financeiro", label: "Inviável financeiramente" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            value === opt.value ? "bg-amber-500/10 border-amber-500/50 text-amber-400" : "border-white/[0.08] text-gray-400 hover:border-white/20"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface SetorFormProps {
  setor: SetorVistoria;
  index: number;
  preexistente: boolean | undefined;
  onChange: (setor: SetorVistoria) => void;
  onRemove: () => void;
}

export function SetorForm({ setor: s, index, preexistente, onChange, onRemove }: SetorFormProps) {
  function set<K extends keyof SetorVistoria>(key: K, value: SetorVistoria[K]) {
    onChange({ ...s, [key]: value });
  }
  function setVent<K extends keyof SetorVistoria["ventilacao"]>(key: K, value: SetorVistoria["ventilacao"][K]) {
    onChange({ ...s, ventilacao: { ...s.ventilacao, [key]: value } });
  }

  const avaliacao = avaliarSetor(s, preexistente);
  const corResultado =
    avaliacao.resultado === "DISPENSADO" ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/5" :
    avaliacao.resultado === "PBD EXIGIDO" ? "text-red-400 border-red-500/40 bg-red-500/5" :
    "text-gray-400 border-white/[0.08] bg-white/[0.02]";

  const candidatas = sugerirAlteracoes(s, avaliacao.ventilacao, s.alteracoes);

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <input
          value={s.nome}
          onChange={(e) => set("nome", e.target.value)}
          placeholder={`Setor ${index + 1} (ex.: Vagas frontais descobertas)`}
          className="flex-1 px-3 py-2 text-sm font-semibold text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500"
        />
        <button type="button" onClick={onRemove} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <label className={labelClass}>Nº de vagas com SAVE</label>
          <input type="number" className={inputClass} value={s.vagas ?? ""} onChange={(e) => set("vagas", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Ocupação</label>
          <select value={s.ocupacao ?? ""} onChange={(e) => set("ocupacao", e.target.value as SetorVistoria["ocupacao"])} className={inputClass}>
            <option value="" className="bg-[#111625]">
              --
            </option>
            {OCUPACOES_ART6_OPCOES.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#111625]">
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Área do ambiente (m²)</label>
          <input type="number" step="0.01" className={inputClass} value={s.areaTotal ?? ""} onChange={(e) => set("areaTotal", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Maior área por pavimento (m²)</label>
          <input type="number" step="0.01" className={inputClass} value={s.areaPavimento ?? ""} onChange={(e) => set("areaPavimento", e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{PERGUNTAS_SETOR.externo}</span>
          <BoolToggle value={s.externo} onChange={(v) => set("externo", v)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{PERGUNTAS_SETOR.deteccao}</span>
          <BoolToggle value={s.deteccao} onChange={(v) => set("deteccao", v)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{PERGUNTAS_SETOR.extracao}</span>
          <BoolToggle value={s.extracao} onChange={(v) => set("extracao", v)} />
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] p-4 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wide">Ventilação natural (Art. 6º, § 1º)</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{PERGUNTAS_SETOR.ventDoisLados}</span>
          <BoolToggle value={s.ventilacao.doisLados} onChange={(v) => setVent("doisLados", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className={labelClass}>Área das aberturas (m²)</label>
            <input type="number" step="0.01" className={inputClass} value={s.ventilacao.areaAbertura ?? ""} onChange={(e) => setVent("areaAbertura", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Área total das fachadas externas (m²)</label>
            <input type="number" step="0.01" className={inputClass} value={s.ventilacao.areaFachada ?? ""} onChange={(e) => setVent("areaFachada", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Comprimento em planta das aberturas (m)</label>
            <input type="number" step="0.01" className={inputClass} value={s.ventilacao.comprimentoAbertura ?? ""} onChange={(e) => setVent("comprimentoAbertura", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Perímetro do pavimento (m)</label>
            <input type="number" step="0.01" className={inputClass} value={s.ventilacao.perimetroPavimento ?? ""} onChange={(e) => setVent("perimetroPavimento", e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs pt-1">
          <span className={avaliacao.ventilacao.pctArea !== null && avaliacao.ventilacao.pctArea >= 20 ? "text-emerald-400" : "text-gray-500"}>
            Área: {avaliacao.ventilacao.pctArea !== null ? `${avaliacao.ventilacao.pctArea.toFixed(1)}%` : "—"} (mín. 20%)
          </span>
          <span className={avaliacao.ventilacao.pctPerimetro !== null && avaliacao.ventilacao.pctPerimetro >= 40 ? "text-emerald-400" : "text-gray-500"}>
            Perímetro: {avaliacao.ventilacao.pctPerimetro !== null ? `${avaliacao.ventilacao.pctPerimetro.toFixed(1)}%` : "—"} (mín. 40%)
          </span>
          <span className={`font-bold ${avaliacao.ventilacao.ok ? "text-emerald-400" : "text-gray-500"}`}>
            {avaliacao.ventilacao.ok ? "Atende ao § 1º" : "Não atende ao § 1º"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{PERGUNTAS_SETOR.sprinklerIN15}</span>
          <BoolToggle value={s.sprinklerIN15} onChange={(v) => set("sprinklerIN15", v)} />
        </div>
        {!s.sprinklerIN15 && (
          <div className="rounded-xl border border-dashed border-white/[0.1] p-3 space-y-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">
              § 2º — alternativa via hidrantes (só válida para edificações preexistentes)
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{PERGUNTAS_SETOR.hidChaveFluxo}</span>
              <BoolToggle value={s.hidChaveFluxo} onChange={(v) => set("hidChaveFluxo", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{PERGUNTAS_SETOR.hidDreno}</span>
              <BoolToggle value={s.hidDreno} onChange={(v) => set("hidDreno", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{PERGUNTAS_SETOR.hidManometro}</span>
              <BoolToggle value={s.hidManometro} onChange={(v) => set("hidManometro", v)} />
            </div>
            {!preexistente && <p className="text-[10px] text-amber-400">Edificação não marcada como preexistente — essa alternativa não se aplica.</p>}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{PERGUNTAS_SETOR.compartRotas}</span>
          <BoolToggle value={s.compartRotas} onChange={(v) => set("compartRotas", v)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{PERGUNTAS_SETOR.compartSaidas}</span>
          <BoolToggle value={s.compartSaidas} onChange={(v) => set("compartSaidas", v)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{PERGUNTAS_SETOR.compartEntreSave}</span>
          <BoolToggle value={s.compartEntreSave} onChange={(v) => set("compartEntreSave", v)} />
        </div>
      </div>

      <div className={`rounded-xl border p-3 text-sm font-bold ${corResultado}`}>
        {avaliacao.resultado}
        {avaliacao.enquadramento ? ` — Inciso ${avaliacao.enquadramento}` : ""}
      </div>

      {candidatas.length > 0 && (
        <div className="rounded-xl border border-dashed border-amber-500/30 p-4 space-y-3">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
            Plano de Adequações — alterações possíveis para viabilizar a dispensa do PBD
          </h4>
          {candidatas.map((a) => (
            <div key={a.key} className="space-y-1.5">
              <span className="text-xs text-gray-300">É possível a instalação de {a.label}?</span>
              <PossibilidadeToggle
                value={a.possivel}
                onChange={(v) => {
                  const outras = s.alteracoes.filter((x) => x.key !== a.key);
                  set("alteracoes", [...outras, { ...a, possivel: v }]);
                }}
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className={labelClass}>Detalhes das adequações propostas</label>
            <textarea
              rows={2}
              className={inputClass}
              placeholder="Ex.: viável instalar detecção no G2; abertura de shafts na fachada norte…"
              value={s.altObs ?? ""}
              onChange={(e) => set("altObs", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className={labelClass}>Observações do setor</label>
        <textarea rows={2} className={inputClass} placeholder="Medidas aferidas, fotos, pendências…" value={s.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Imagens do setor</label>
        <ImageUploader imagens={s.imagens} onChange={(imagens) => set("imagens", imagens)} />
      </div>
    </div>
  );
}
