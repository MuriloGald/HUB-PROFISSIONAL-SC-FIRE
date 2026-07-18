"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { salvarClienteEvento } from "@/app/actions/laudos";
import { formatCEP, formatCNPJ, formatCPF, formatPhone } from "@/lib/laudos/formatters";
import { validarCNPJ, validarCPF } from "@/lib/laudos/validators";
import type { Cliente } from "@/lib/supabase/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface ClienteFormProps {
  cliente?: Cliente;
  /** Para onde ir apos salvar (ex: para retomar o wizard de evento). Default: lista de clientes. */
  redirectTo?: string;
}

export function ClienteForm({ cliente, redirectTo }: ClienteFormProps) {
  const router = useRouter();
  const isEdit = Boolean(cliente);

  const cnpjCpfDigits = cliente?.cnpj_cpf?.replace(/\D/g, "") ?? "";
  const [cnpj, setCnpj] = useState(cnpjCpfDigits.length === 14 ? formatCNPJ(cnpjCpfDigits) : "");
  const [cpf, setCpf] = useState(cnpjCpfDigits.length === 11 ? formatCPF(cnpjCpfDigits) : "");
  const [razaoSocial, setRazaoSocial] = useState(cliente?.razao_social ?? "");
  const [nomeResponsavel, setNomeResponsavel] = useState(cliente?.responsavel_nome ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ? formatPhone(cliente.telefone) : "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [cep, setCep] = useState(cliente?.cep ? formatCEP(cliente.cep) : "");
  const [estado, setEstado] = useState(cliente?.estado ?? "SC");
  const [cidade, setCidade] = useState(cliente?.cidade ?? "");
  const [bairro, setBairro] = useState(cliente?.bairro ?? "");
  const [logradouro, setLogradouro] = useState(cliente?.logradouro ?? "");
  const [numero, setNumero] = useState(cliente?.numero ?? "");
  const [complemento, setComplemento] = useState(cliente?.complemento ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function buscarCep() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setErrors((e) => ({ ...e, cep: "CEP inválido" }));
      return;
    }
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setLogradouro(data.logradouro);
        setBairro(data.bairro);
        setCidade(data.localidade);
        setEstado(data.uf);
        setErrors((e) => ({ ...e, cep: "" }));
      } else {
        setErrors((e) => ({ ...e, cep: "CEP não encontrado" }));
      }
    } catch {
      setErrors((e) => ({ ...e, cep: "Erro ao buscar CEP" }));
    } finally {
      setBuscandoCep(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (cnpj && !validarCNPJ(cnpj)) newErrors.cnpj = "CNPJ inválido";
    if (cpf && !validarCPF(cpf)) newErrors.cpf = "CPF inválido";
    if (!cnpj && !cpf) newErrors.cnpj = "Informe o CNPJ ou CPF";

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    setSalvando(true);
    const result = await salvarClienteEvento({
      id: cliente?.id,
      cnpj: cnpj || undefined,
      cpf: cpf || undefined,
      razao_social: razaoSocial,
      nome_responsavel: nomeResponsavel,
      telefone,
      email,
      cep,
      estado,
      cidade,
      bairro,
      logradouro,
      numero,
      complemento,
    });
    setSalvando(false);

    if ("error" in result) {
      setErrors({ geral: result.error ?? "Erro ao salvar cliente" });
      return;
    }

    router.push(redirectTo ? `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}clienteId=${result.data.id}` : "/laudos/clientes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      {errors.geral && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{errors.geral}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>CNPJ</label>
          <input className={inputClass} placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} />
          {errors.cnpj && <span className="text-xs text-red-400">{errors.cnpj}</span>}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CPF (opcional)</label>
          <input className={inputClass} placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} />
          {errors.cpf && <span className="text-xs text-red-400">{errors.cpf}</span>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Razão Social / Nome da Empresa</label>
        <input className={inputClass} required value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Nome do Responsável Legal</label>
        <input className={inputClass} required value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Telefone</label>
          <input className={inputClass} required placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(formatPhone(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>E-mail</label>
          <input type="email" className={inputClass} required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <h3 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Endereço</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>CEP</label>
          <div className="flex gap-2">
            <input className={inputClass} required placeholder="00000-000" value={cep} onChange={(e) => setCep(formatCEP(e.target.value))} />
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
          {errors.cep && <span className="text-xs text-red-400">{errors.cep}</span>}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Estado</label>
          <input className={inputClass} required maxLength={2} value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} required value={cidade} onChange={(e) => setCidade(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input className={inputClass} required value={bairro} onChange={(e) => setBairro(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Logradouro / Endereço</label>
          <input className={inputClass} required value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Número</label>
          <input className={inputClass} required value={numero} onChange={(e) => setNumero(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Complemento (opcional)</label>
        <input className={inputClass} value={complemento} onChange={(e) => setComplemento(e.target.value)} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/laudos/clientes")}
          className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
        >
          {salvando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isEdit ? "Salvar Alterações" : "Salvar Cliente"}
        </button>
      </div>
    </form>
  );
}
