"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Search, Loader2 } from "lucide-react";
import { formatCEP } from "@/lib/laudos/formatters";
import type { HabiteseWizardState } from "@/lib/habitese/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface StepImovelProps {
  state: HabiteseWizardState;
  onBack: () => void;
  onNext: (partial: Partial<HabiteseWizardState>) => void;
}

export function StepImovel({ state, onBack, onNext }: StepImovelProps) {
  const cliente = state.cliente;

  const [form, setForm] = useState({
    imovel_re: state.imovel_re ?? "",
    imovel_cnpj_cpf: state.imovel_cnpj_cpf ?? cliente?.cnpj ?? cliente?.cpf ?? "",
    imovel_cep: state.imovel_cep ?? "",
    imovel_logradouro: state.imovel_logradouro ?? "",
    imovel_numero: state.imovel_numero ?? "",
    imovel_bairro: state.imovel_bairro ?? "",
    imovel_cidade: state.imovel_cidade ?? "",
    imovel_complemento: state.imovel_complemento ?? "",
    imovel_detalhes: state.imovel_detalhes ?? "",
    nome_edificacao: state.nome_edificacao ?? "",
    extintores_qtd: state.extintores_qtd ?? "",
    iluminacao_qtd: state.iluminacao_qtd ?? "",
    placa_qtd: state.placa_qtd ?? "",
    placa_luminosa_qtd: state.placa_luminosa_qtd ?? "",
  });
  const [mesmoEndereco, setMesmoEndereco] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepInfo, setCepInfo] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleMesmoEndereco(checked: boolean) {
    setMesmoEndereco(checked);
    if (checked && cliente) {
      setForm((f) => ({
        ...f,
        imovel_cep: cliente.cep ?? "",
        imovel_logradouro: cliente.logradouro ?? "",
        imovel_numero: cliente.numero ?? "",
        imovel_bairro: cliente.bairro ?? "",
        imovel_cidade: cliente.cidade ?? "",
        imovel_complemento: cliente.complemento ?? "",
      }));
    }
  }

  async function buscarCep() {
    const cepLimpo = form.imovel_cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setCepInfo("CEP incompleto — preenchendo o endereço manualmente é só continuar.");
      return;
    }
    setBuscandoCep(true);
    setCepInfo("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((f) => ({ ...f, imovel_logradouro: data.logradouro, imovel_bairro: data.bairro, imovel_cidade: data.localidade }));
      } else {
        setCepInfo("CEP não encontrado — preencha o endereço manualmente.");
      }
    } catch {
      setCepInfo("Não consegui buscar o CEP agora — preencha o endereço manualmente.");
    } finally {
      setBuscandoCep(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext(form);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Descrição do Imóvel</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>RE</label>
          <input className={inputClass} value={form.imovel_re} onChange={(e) => update("imovel_re", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CNPJ/CPF</label>
          <input className={inputClass} value={form.imovel_cnpj_cpf} onChange={(e) => update("imovel_cnpj_cpf", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Endereço do Imóvel</h4>

      {cliente && (
        <label className="flex items-center gap-2 text-sm text-red-400 font-medium cursor-pointer">
          <input type="checkbox" checked={mesmoEndereco} onChange={(e) => toggleMesmoEndereco(e.target.checked)} className="accent-red-500" />
          O imóvel fica no mesmo endereço do responsável
        </label>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>CEP</label>
          <div className="flex gap-2">
            <input
              className={inputClass}
              placeholder="00000-000"
              value={form.imovel_cep}
              onChange={(e) => update("imovel_cep", formatCEP(e.target.value))}
            />
            <button
              type="button"
              onClick={buscarCep}
              disabled={buscandoCep}
              className="px-3 rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              {buscandoCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Buscar
            </button>
          </div>
          {cepInfo && <span className="text-xs text-gray-400">{cepInfo}</span>}
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>Logradouro</label>
          <input className={inputClass} value={form.imovel_logradouro} onChange={(e) => update("imovel_logradouro", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Número</label>
          <input className={inputClass} value={form.imovel_numero} onChange={(e) => update("imovel_numero", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input className={inputClass} value={form.imovel_bairro} onChange={(e) => update("imovel_bairro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} value={form.imovel_cidade} onChange={(e) => update("imovel_cidade", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Complemento</label>
        <input className={inputClass} value={form.imovel_complemento} onChange={(e) => update("imovel_complemento", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Nome da Edificação (opcional — usado no Anexo I)</label>
        <input className={inputClass} value={form.nome_edificacao} onChange={(e) => update("nome_edificacao", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Detalhes (se houver)</label>
        <textarea rows={2} className={inputClass} value={form.imovel_detalhes} onChange={(e) => update("imovel_detalhes", e.target.value)} />
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Quantidade de Equipamentos Instalados</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Extintores (quantidade total)</label>
          <input type="number" min="0" className={inputClass} value={form.extintores_qtd} onChange={(e) => update("extintores_qtd", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Iluminação de Emergência</label>
          <input type="number" min="0" className={inputClass} value={form.iluminacao_qtd} onChange={(e) => update("iluminacao_qtd", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Placa Saída Fotoluminescente</label>
          <input type="number" min="0" className={inputClass} value={form.placa_qtd} onChange={(e) => update("placa_qtd", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Placa Saída Luminosa</label>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.placa_luminosa_qtd}
            onChange={(e) => update("placa_luminosa_qtd", e.target.value)}
          />
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
