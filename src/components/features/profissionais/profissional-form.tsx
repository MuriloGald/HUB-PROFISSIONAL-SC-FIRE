"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { salvarProfissional } from "@/app/actions/profissionais";
import { formatCPF, formatPhone } from "@/lib/laudos/formatters";
import { validarCPF } from "@/lib/laudos/validators";
import type { Profissional, RegistroConselhoTipo } from "@/lib/supabase/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";
const avisoClass = "text-xs text-amber-400";

interface ProfissionalFormProps {
  profissional?: Profissional;
  /** Para onde ir apos salvar (ex: para retomar o wizard de um documento). Default: lista central de profissionais. */
  redirectTo?: string;
}

export function ProfissionalForm({ profissional, redirectTo }: ProfissionalFormProps) {
  const router = useRouter();
  const isEdit = Boolean(profissional);

  const [nome, setNome] = useState(profissional?.nome ?? "");
  const [cpf, setCpf] = useState(profissional?.cpf ? formatCPF(profissional.cpf) : "");
  const [telefone, setTelefone] = useState(profissional?.telefone ? formatPhone(profissional.telefone) : "");
  const [email, setEmail] = useState(profissional?.email ?? "");
  const [registroTipo, setRegistroTipo] = useState<RegistroConselhoTipo>(profissional?.registro_tipo ?? "crea");
  const [registroNumero, setRegistroNumero] = useState(profissional?.registro_numero ?? "");

  const [erroGeral, setErroGeral] = useState("");
  const [pendingWarnings, setPendingWarnings] = useState<Record<string, string> | null>(null);
  const [salvando, setSalvando] = useState(false);

  function calcularAvisos(): Record<string, string> {
    const avisos: Record<string, string> = {};

    if (cpf && !validarCPF(cpf)) avisos.cpf = "CPF com dígito inválido";
    if (!cpf) avisos.cpf = avisos.cpf ?? "CPF não informado";

    const camposObrigatorios: { key: string; label: string; valor: string }[] = [
      { key: "nome", label: "Nome", valor: nome },
      { key: "telefone", label: "Telefone", valor: telefone },
      { key: "email", label: "E-mail", valor: email },
      { key: "registroNumero", label: "Número de Registro", valor: registroNumero },
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
    const result = await salvarProfissional({
      id: profissional?.id,
      nome,
      cpf: cpf || undefined,
      telefone,
      email,
      registro_tipo: registroTipo,
      registro_numero: registroNumero,
    });
    setSalvando(false);

    if ("error" in result) {
      setErroGeral(result.error ?? "Erro ao salvar profissional");
      return;
    }

    router.push(redirectTo ? `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}profissionalId=${result.data.id}` : "/profissionais");
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

      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome</label>
          <input className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} />
          {pendingWarnings?.nome && <span className={avisoClass}>{pendingWarnings.nome}</span>}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CPF</label>
          <input className={inputClass} placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} />
          {pendingWarnings?.cpf && <span className={avisoClass}>{pendingWarnings.cpf}</span>}
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Tipo de Registro</label>
          <div className="flex gap-2 pt-1">
            {(
              [
                { value: "crea", label: "CREA" },
                { value: "cft", label: "CFT" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRegistroTipo(opt.value)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  registroTipo === opt.value
                    ? "bg-red-500/10 border-red-500/50 text-red-400"
                    : "border-white/[0.08] text-gray-400 hover:border-white/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Número de Registro</label>
          <input className={inputClass} value={registroNumero} onChange={(e) => setRegistroNumero(e.target.value)} />
          {pendingWarnings?.registroNumero && <span className={avisoClass}>{pendingWarnings.registroNumero}</span>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/profissionais")}
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
          {pendingWarnings ? "Salvar Mesmo Assim" : isEdit ? "Salvar Alterações" : "Salvar Profissional"}
        </button>
      </div>
    </form>
  );
}
