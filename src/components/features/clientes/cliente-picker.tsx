"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import type { Cliente } from "@/lib/supabase/types";
import type { ClienteSnapshot } from "@/lib/clientes/types";
import { clienteParaSnapshot } from "@/lib/clientes/snapshot";

interface ClientePickerProps {
  clientes: Cliente[];
  clienteIdInicial?: string;
  /** Para onde voltar depois de cadastrar um cliente novo a partir daqui (ex: o wizard que chamou este picker). */
  redirectToNovoCliente: string;
  titulo?: string;
  onNext: (clienteId: string, cliente: ClienteSnapshot) => void;
}

/** Seletor de cliente compartilhado por todos os wizards de documento — consulta a base única de clientes. */
export function ClientePicker({ clientes, clienteIdInicial, redirectToNovoCliente, titulo = "Selecione o Cliente", onNext }: ClientePickerProps) {
  const [selecionado, setSelecionado] = useState(clienteIdInicial ?? "");

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">{titulo}</h3>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cliente cadastrado</label>
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
          href={`/clientes/novo?redirectTo=${encodeURIComponent(redirectToNovoCliente)}`}
          className="inline-flex items-center gap-2 px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Cadastrar Novo Cliente
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
