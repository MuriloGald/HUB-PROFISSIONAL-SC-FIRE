"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, AlertTriangle } from "lucide-react";
import { salvarClienteEvento } from "@/app/actions/laudos";
import { formatCEP, formatCNPJ, formatCPF, formatPhone } from "@/lib/laudos/formatters";
import { validarCNPJ, validarCPF } from "@/lib/laudos/validators";
import type { Cliente } from "@/lib/supabase/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";
const avisoClass = "text-xs text-amber-400";

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

  const [erroGeral, setErroGeral] = useState("");
  const [pendingWarnings, setPendingWarnings] = useState<Record<string, string> | null>(null);
  const [cepInfo, setCepInfo] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function buscarCep() {
    const cepLimpo = cep.replace(/\D/g, "");
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
        setLogradouro(data.logradouro);
        setBairro(data.bairro);
        setCidade(data.localidade);
        setEstado(data.uf);
      } else {
        setCepInfo("CEP não encontrado — preencha o endereço manualmente.");
      }
    } catch {
      setCepInfo("Não consegui buscar o CEP agora — preencha o endereço manualmente.");
    } finally {
      setBuscandoCep(false);
    }
  }

  function calcularAvisos(): Record<string, string> {
    const avisos: Record<string, string> = {};

    if (cnpj && !validarCNPJ(cnpj)) avisos.cnpj = "CNPJ com dígito inválido";
    if (cpf && !validarCPF(cpf)) avisos.cpf = "CPF com dígito inválido";
    if (!cnpj && !cpf) avisos.cnpj = avisos.cnpj ?? "CNPJ/CPF não informado";

    const camposObrigatorios: { key: string; label: string; valor: string }[] = [
      { key: "razaoSocial", label: "Razão Social", valor: razaoSocial },
      { key: "nomeResponsavel", label: "Nome do Responsável", valor: nomeResponsavel },
      { key: "telefone", label: "Telefone", valor: telefone },
      { key: "email", label: "E-mail", valor: email },
      { key: "cep", label: "CEP", valor: cep },
      { key: "estado", label: "Estado", valor: estado },
      { key: "cidade", label: "Cidade", valor: cidade },
      { key: "bairro", label: "Bairro", valor: bairro },
      { key: "logradouro", label: "Logradouro", valor: logradouro },
      { key: "numero", label: "Número", valor: numero },
    ];
    camposObrigatorios.forEach((c) => {
      if (!c.valor.trim()) avisos[c.key] = `${c.label} está em branco`;
    });

    return avisos;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErroGeral("");

    // Primeiro clique: se houver algo estranho, so avisa e espera confirmacao.
    // Segundo clique (ja com o aviso na tela): salva mesmo assim, sem checar de novo.
    if (!pendingWarnings) {
      const avisos = calcularAvisos();
      if (Object.keys(avisos).length > 0) {
        setPendingWarnings(avisos);
        return;
      }
    }

    setPendingWarnings(null);
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
      setErroGeral(result.error ?? "Erro ao salvar cliente");
      return;
    }

    router.push(redirectTo ? `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}clienteId=${result.data.id}` : "/laudos/clientes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      {erroGeral && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erroGeral}</div>}

      {pendingWarnings && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm space-y-2">
          <p className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Encontrei estes pontos — confira antes de continuar:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {Object.values(pendingWarnings).map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
          <p className="text-gray-400">Clique em &quot;Salvar Mesmo Assim&quot; se quiser continuar do jeito que está.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>CNPJ</label>
          <input className={inputClass} placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} />
          {pendingWarnings?.cnpj && <span className={avisoClass}>{pendingWarnings.cnpj}</span>}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CPF (opcional)</label>
          <input className={inputClass} placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} />
          {pendingWarnings?.cpf && <span className={avisoClass}>{pendingWarnings.cpf}</span>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Razão Social / Nome da Empresa</label>
        <input className={inputClass} value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
        {pendingWarnings?.razaoSocial && <span className={avisoClass}>{pendingWarnings.razaoSocial}</span>}
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Nome do Responsável Legal</label>
        <input className={inputClass} value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} />
        {pendingWarnings?.nomeResponsavel && <span className={avisoClass}>{pendingWarnings.nomeResponsavel}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Telefone</label>
          <input className={inputClass} placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(formatPhone(e.target.value))} />
          {pendingWarnings?.telefone && <span className={avisoClass}>{pendingWarnings.telefone}</span>}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>E-mail</label>
          <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          {pendingWarnings?.email && <span className={avisoClass}>{pendingWarnings.email}</span>}
        </div>
      </div>

      <h3 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Endereço</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>CEP</label>
          <div className="flex gap-2">
            <input className={inputClass} placeholder="00000-000" value={cep} onChange={(e) => setCep(formatCEP(e.target.value))} />
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
          {pendingWarnings?.cep && <span className={avisoClass}>{pendingWarnings.cep}</span>}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Estado</label>
          <input className={inputClass} maxLength={2} value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} />
          {pendingWarnings?.estado && <span className={avisoClass}>{pendingWarnings.estado}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} value={cidade} onChange={(e) => setCidade(e.target.value)} />
          {pendingWarnings?.cidade && <span className={avisoClass}>{pendingWarnings.cidade}</span>}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input className={inputClass} value={bairro} onChange={(e) => setBairro(e.target.value)} />
          {pendingWarnings?.bairro && <span className={avisoClass}>{pendingWarnings.bairro}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Logradouro / Endereço</label>
          <input className={inputClass} value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
          {pendingWarnings?.logradouro && <span className={avisoClass}>{pendingWarnings.logradouro}</span>}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Número</label>
          <input className={inputClass} value={numero} onChange={(e) => setNumero(e.target.value)} />
          {pendingWarnings?.numero && <span className={avisoClass}>{pendingWarnings.numero}</span>}
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
          className={`px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 hover:scale-[1.02] ${
            pendingWarnings
              ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-500/10 hover:shadow-amber-500/20"
              : "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 shadow-red-500/10 hover:shadow-red-500/20"
          }`}
        >
          {salvando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {pendingWarnings ? "Salvar Mesmo Assim" : isEdit ? "Salvar Alterações" : "Salvar Cliente"}
        </button>
      </div>
    </form>
  );
}
