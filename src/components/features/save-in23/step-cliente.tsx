"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import type { Cliente } from "@/lib/supabase/types";
import type { ClienteSave23Snapshot } from "@/lib/save-in23/types";

export function clienteParaSnapshot(c: Cliente): ClienteSave23Snapshot {
  const digits = c.cnpj_cpf?.replace(/\D/g, "") ?? "";
  return {
    id: c.id,
    razao_social: c.razao_social ?? c.nome,
    cnpj: digits.length === 14 ? c.cnpj_cpf ?? undefined : undefined,
    cpf: digits.length === 11 ? c.cnpj_cpf ?? undefined : undefined,
    nome_responsavel: c.responsavel_nome ?? undefined,
    email: c.email ?? undefined,
    telefone: c.telefone ?? undefined,
    logradouro: c.logradouro ?? undefined,
    numero: c.numero ?? undefined,
    bairro: c.bairro ?? undefined,
    complemento: c.complemento ?? undefined,
    cidade: c.cidade ?? undefined,
    estado: c.estado ?? undefined,
    cep: c.cep ?? undefined,
    re: c.re ?? undefined,
    preexistente: c.preexistente ?? undefined,
    area_construida: c.area_construida ?? undefined,
    pavimentos: c.pavimentos ?? undefined,
    altura: c.altura ?? undefined,
    validade_atestado: c.validade_atestado ?? undefined,
  };
}

interface StepClienteProps {
  clientes: Cliente[];
  clienteIdInicial?: string;
  redirectToNovoCliente: string;
  onNext: (clienteId: string, cliente: ClienteSave23Snapshot) => void;
}

export function StepCliente({ clientes, clienteIdInicial, redirectToNovoCliente, onNext }: StepClienteProps) {
  const [selecionado, setSelecionado] = useState(clienteIdInicial ?? "");

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Selecione a Edificação</h3>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Edificação cadastrada</label>
        <select
          value={selecionado}
          onChange={(e) => setSelecionado(e.target.value)}
          className="w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        >
          <option value="" className="bg-[#111625]">
            -- Selecione --
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#111625]">
              {c.razao_social} ({c.cnpj_cpf || "sem documento"})
            </option>
          ))}
        </select>
      </div>

      <div className="text-center text-xs text-gray-500">ou</div>

      <div className="text-center">
        <Link
          href={`/relatorios/save-in23/clientes/novo?redirectTo=${redirectToNovoCliente}`}
          className="inline-flex items-center gap-2 px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Cadastrar Nova Edificação
        </Link>
      </div>

      <div className="flex justify-end pt-2">
        <button
          disabled={!selecionado}
          onClick={() => {
            const cliente = clientes.find((c) => c.id === selecionado);
            if (cliente) onNext(selecionado, clienteParaSnapshot(cliente));
          }}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
        >
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
