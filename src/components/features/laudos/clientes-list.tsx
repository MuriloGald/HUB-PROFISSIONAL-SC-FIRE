"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, CalendarPlus, PackageOpen, MapPin } from "lucide-react";
import type { Cliente } from "@/lib/supabase/types";

export function ClientesList({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter();
  const [termo, setTermo] = useState("");

  const filtrados = useMemo(() => {
    const t = termo.toLowerCase();
    return clientes.filter(
      (c) =>
        c.razao_social?.toLowerCase().includes(t) ||
        c.cnpj_cpf?.toLowerCase().includes(t) ||
        c.responsavel_nome?.toLowerCase().includes(t)
    );
  }, [clientes, termo]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Clientes de Eventos</h1>
          <p className="text-sm text-gray-400 mt-1">Gerencie os organizadores/responsáveis legais ou inicie um novo evento.</p>
        </div>
        <Link
          href="/laudos/clientes/novo"
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </Link>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por razão social, CNPJ/CPF ou responsável..."
          className="w-full pl-10 pr-3 py-2.5 text-sm text-white bg-white/[0.02] border border-white/[0.08] rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        />
      </div>

      <div className="grid gap-3">
        {filtrados.length === 0 && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center py-12">
            <PackageOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-gray-400 font-semibold">Nenhum cliente encontrado</h3>
            <p className="text-xs text-gray-500 mt-1">{termo ? "Tente buscar por outro termo." : "Comece cadastrando um novo cliente."}</p>
          </div>
        )}

        {filtrados.map((c) => (
          <div
            key={c.id}
            className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <h3 className="text-white font-semibold">{c.razao_social}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                <strong className="text-gray-300">CNPJ/CPF:</strong> {c.cnpj_cpf || "Não informado"} |{" "}
                <strong className="text-gray-300">Responsável:</strong> {c.responsavel_nome}
              </p>
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {c.cidade} - {c.estado}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/laudos/clientes/${c.id}/editar`}
                title="Editar cliente"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 transition-all"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <button
                onClick={() => router.push(`/laudos/eventos/novo?clienteId=${c.id}`)}
                className="px-3 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
              >
                <CalendarPlus className="w-3.5 h-3.5" /> Novo Evento
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
