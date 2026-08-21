"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Trash2, UserCog, BadgeCheck } from "lucide-react";
import { excluirProfissional } from "@/app/actions/profissionais";
import type { Profissional } from "@/lib/supabase/types";

export function ProfissionaisList({ profissionais }: { profissionais: Profissional[] }) {
  const router = useRouter();
  const [termo, setTermo] = useState("");
  const [excluindo, setExcluindo] = useState<string | null>(null);

  async function handleExcluir(p: Profissional) {
    const ok = confirm(`Excluir "${p.nome}" permanentemente? Documentos já emitidos com esse profissional não são afetados. Essa ação não pode ser desfeita.`);
    if (!ok) return;
    setExcluindo(p.id);
    await excluirProfissional(p.id);
    setExcluindo(null);
    router.refresh();
  }

  const filtrados = useMemo(() => {
    const t = termo.toLowerCase();
    return profissionais.filter(
      (p) => p.nome.toLowerCase().includes(t) || p.cpf?.toLowerCase().includes(t) || p.registro_numero?.toLowerCase().includes(t)
    );
  }, [profissionais, termo]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Profissionais</h1>
          <p className="text-sm text-gray-400 mt-1">Cadastro único de Responsáveis Técnicos (CREA/CFT), consultado por todos os módulos de documento.</p>
        </div>
        <Link
          href="/profissionais/novo"
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Profissional
        </Link>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome, CPF ou nº de registro..."
          className="w-full pl-10 pr-3 py-2.5 text-sm text-white bg-white/[0.02] border border-white/[0.08] rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        />
      </div>

      <div className="grid gap-3">
        {filtrados.length === 0 && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center py-12">
            <UserCog className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-gray-400 font-semibold">Nenhum profissional encontrado</h3>
            <p className="text-xs text-gray-500 mt-1">{termo ? "Tente buscar por outro termo." : "Comece cadastrando um novo profissional."}</p>
          </div>
        )}

        {filtrados.map((p) => (
          <div
            key={p.id}
            className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-white font-semibold">{p.nome}</h3>
                {(p.registro_tipo === "crea" || p.registro_tipo === "cft") && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-white/[0.04] border border-white/[0.08] rounded-full uppercase">
                    {p.registro_tipo}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                <strong className="text-gray-300">CPF:</strong> {p.cpf || "Não informado"} |{" "}
                <strong className="text-gray-300">Telefone:</strong> {p.telefone || "Não informado"}
              </p>
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" /> {p.registro_tipo === "cft" ? "CFT" : p.registro_tipo === "crea" ? "CREA/SC" : "Sem registro"}{" "}
                {p.registro_numero || ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/profissionais/${p.id}/editar`}
                title="Editar profissional"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 transition-all"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleExcluir(p)}
                disabled={excluindo === p.id}
                title="Excluir profissional"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
