"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Leaf, Zap, Flame } from "lucide-react";
import { classificarEvento, type Porte } from "@/lib/laudos/classificador";
import type { EventoWizardState } from "@/lib/laudos/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

const PORTE_BADGE: Record<Porte, { label: string; icon: typeof Leaf; className: string }> = {
  pequeno: { label: "Pequeno Porte", icon: Leaf, className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  medio: { label: "Médio Porte", icon: Zap, className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  grande: { label: "Grande Porte", icon: Flame, className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

interface StepInfoBaseProps {
  state: EventoWizardState;
  onBack: () => void;
  onNext: (partial: Partial<EventoWizardState>) => void;
}

export function StepInfoBase({ state, onBack, onNext }: StepInfoBaseProps) {
  const cliente = state.cliente;

  const [form, setForm] = useState({
    nome_evento: state.nome_evento ?? "",
    descricao_evento: state.descricao_evento ?? "",
    data_inicio: state.data_inicio ?? "",
    hora_inicio: state.hora_inicio ?? "",
    data_termino: state.data_termino ?? "",
    hora_termino: state.hora_termino ?? "",
    cep_evento: state.cep_evento ?? "",
    logradouro_evento: state.logradouro_evento ?? "",
    numero_evento: state.numero_evento ?? "",
    bairro_evento: state.bairro_evento ?? "",
    cidade_evento: state.cidade_evento ?? "",
    complemento_evento: state.complemento_evento ?? "",
    publico: state.publico ?? "",
    area_total: state.area_total ?? "",
    area_permanente: state.area_permanente ?? "",
    area_provisoria: state.area_provisoria ?? "",
    arLivreSemDelimitacao: state.arLivreSemDelimitacao ?? false,
    arLivreComDelimitacao: state.arLivreComDelimitacao ?? false,
    publicoArLivre: state.publicoArLivre ?? "",
    cobertoAberto: state.cobertoAberto ?? false,
    publicoCobertoAberto: state.publicoCobertoAberto ?? "",
    cobertoFechado: state.cobertoFechado ?? false,
    publicoCobertoFechado: state.publicoCobertoFechado ?? "",
  });
  const [porteManual, setPorteManual] = useState<Porte | undefined>(state.porteFinal);
  const [mesmoEndereco, setMesmoEndereco] = useState(false);

  const porteSugerido = useMemo(
    () =>
      classificarEvento({
        arLivreComDelimitacao: form.arLivreComDelimitacao,
        publicoArLivre: form.publicoArLivre,
        cobertoAberto: form.cobertoAberto,
        publicoCobertoAberto: form.publicoCobertoAberto,
        cobertoFechado: form.cobertoFechado,
        publicoCobertoFechado: form.publicoCobertoFechado,
      }),
    [form.arLivreComDelimitacao, form.publicoArLivre, form.cobertoAberto, form.publicoCobertoAberto, form.cobertoFechado, form.publicoCobertoFechado]
  );

  const porte = porteManual ?? porteSugerido;
  const Badge = PORTE_BADGE[porte];

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleMesmoEndereco(checked: boolean) {
    setMesmoEndereco(checked);
    if (checked && cliente) {
      setForm((f) => ({
        ...f,
        cep_evento: cliente.cep ?? "",
        logradouro_evento: cliente.logradouro ?? "",
        numero_evento: cliente.numero ?? "",
        bairro_evento: cliente.bairro ?? "",
        cidade_evento: cliente.cidade ?? "",
        complemento_evento: cliente.complemento ?? "",
      }));
    } else {
      setForm((f) => ({
        ...f,
        cep_evento: "",
        logradouro_evento: "",
        numero_evento: "",
        bairro_evento: "",
        cidade_evento: "",
        complemento_evento: "",
      }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ ...form, porteFinal: porte });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Informações do Evento</h3>

      <div className="space-y-1.5">
        <label className={labelClass}>Nome do Evento</label>
        <input className={inputClass} required value={form.nome_evento} onChange={(e) => update("nome_evento", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Descrição do Evento</label>
        <textarea
          rows={2}
          className={inputClass}
          placeholder="Descreva brevemente as atividades do evento..."
          value={form.descricao_evento}
          onChange={(e) => update("descricao_evento", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5 col-span-1">
          <label className={labelClass}>Data de Início</label>
          <input type="date" required className={inputClass} value={form.data_inicio} onChange={(e) => update("data_inicio", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Hora</label>
          <input type="time" required className={inputClass} value={form.hora_inicio} onChange={(e) => update("hora_inicio", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Data de Término</label>
          <input type="date" required className={inputClass} value={form.data_termino} onChange={(e) => update("data_termino", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Hora</label>
          <input type="time" required className={inputClass} value={form.hora_termino} onChange={(e) => update("hora_termino", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Endereço do Evento</h4>

      {cliente && (
        <label className="flex items-center gap-2 text-sm text-red-400 font-medium cursor-pointer">
          <input type="checkbox" checked={mesmoEndereco} onChange={(e) => toggleMesmoEndereco(e.target.checked)} className="accent-red-500" />
          O evento será no mesmo endereço do cliente
        </label>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>CEP</label>
          <input required className={inputClass} value={form.cep_evento} onChange={(e) => update("cep_evento", e.target.value)} />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>Logradouro (Rua, Av.)</label>
          <input required className={inputClass} value={form.logradouro_evento} onChange={(e) => update("logradouro_evento", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Número</label>
          <input required className={inputClass} value={form.numero_evento} onChange={(e) => update("numero_evento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input required className={inputClass} value={form.bairro_evento} onChange={(e) => update("bairro_evento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input required className={inputClass} value={form.cidade_evento} onChange={(e) => update("cidade_evento", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Complemento / Ponto de Referência</label>
        <input className={inputClass} value={form.complemento_evento} onChange={(e) => update("complemento_evento", e.target.value)} />
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Quadro de Áreas e Público</h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Público Total Previsto</label>
          <input type="number" required className={inputClass} value={form.publico} onChange={(e) => update("publico", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Área total (m²)</label>
          <input required className={inputClass} value={form.area_total} onChange={(e) => update("area_total", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Instalações permanentes (m²)</label>
          <input required className={inputClass} value={form.area_permanente} onChange={(e) => update("area_permanente", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Estruturas provisórias (m²)</label>
          <input required className={inputClass} value={form.area_provisoria} onChange={(e) => update("area_provisoria", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Classificação dos Ambientes</h4>
      <p className="text-xs text-gray-400 -mt-4">Preencha para que o sistema sugira o porte do evento de acordo com a IN 24.</p>

      <div className="space-y-4">
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4">
          <label className="flex items-center gap-2 text-sm text-white font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={form.arLivreSemDelimitacao}
              onChange={(e) => update("arLivreSemDelimitacao", e.target.checked)}
              className="accent-red-500"
            />
            Ar livre sem delimitação de área (praças, vias públicas)
          </label>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm text-white font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={form.arLivreComDelimitacao}
              onChange={(e) => update("arLivreComDelimitacao", e.target.checked)}
              className="accent-red-500"
            />
            Ar livre com delimitação de área
          </label>
          {form.arLivreComDelimitacao && (
            <div className="space-y-1.5">
              <label className={labelClass}>Público Previsto (ar livre)</label>
              <input type="number" className={inputClass} value={form.publicoArLivre} onChange={(e) => update("publicoArLivre", e.target.value)} />
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm text-white font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={form.cobertoAberto}
              onChange={(e) => update("cobertoAberto", e.target.checked)}
              className="accent-red-500"
            />
            Local coberto e aberto nas laterais (tendas, lona)
          </label>
          {form.cobertoAberto && (
            <div className="space-y-1.5">
              <label className={labelClass}>Público Previsto (coberto e aberto)</label>
              <input type="number" className={inputClass} value={form.publicoCobertoAberto} onChange={(e) => update("publicoCobertoAberto", e.target.value)} />
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm text-white font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={form.cobertoFechado}
              onChange={(e) => update("cobertoFechado", e.target.checked)}
              className="accent-red-500"
            />
            Local coberto e fechado nas laterais (pavilhões, ginásios)
          </label>
          {form.cobertoFechado && (
            <div className="space-y-1.5">
              <label className={labelClass}>Público Previsto (coberto e fechado)</label>
              <input type="number" className={inputClass} value={form.publicoCobertoFechado} onChange={(e) => update("publicoCobertoFechado", e.target.value)} />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border-2 border-dashed border-red-500/20 bg-white/[0.02] p-5 text-center space-y-3">
        <h4 className="text-sm font-bold text-white">Porte Sugerido</h4>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${Badge.className}`}>
          <Badge.icon className="w-4 h-4" /> {Badge.label}
        </div>
        <div className="space-y-1.5 max-w-xs mx-auto text-left">
          <label className={labelClass}>Você pode alterar manualmente se desejar</label>
          <select
            className={inputClass}
            value={porte}
            onChange={(e) => setPorteManual(e.target.value as Porte)}
          >
            <option value="pequeno" className="bg-[#111625]">Pequeno Porte</option>
            <option value="medio" className="bg-[#111625]">Médio Porte</option>
            <option value="grande" className="bg-[#111625]">Grande Porte</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
