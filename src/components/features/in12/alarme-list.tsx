"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileDown, Edit, Trash2, Loader2, FileCheck2 } from "lucide-react";
import { excluirAlarmeIn12 } from "@/app/actions/in12";
import type { Laudo } from "@/lib/supabase/types";
import type { AlarmeIn12State } from "@/lib/in12/types";

interface AlarmeListProps {
  laudos: Laudo[];
}

export function AlarmeList({ laudos }: AlarmeListProps) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [baixandoId, setBaixandoId] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const filtrados = laudos.filter((l) => {
    const dados = l.dados as AlarmeIn12State;
    const termo = busca.toLowerCase();
    return (
      (dados.codigo?.toLowerCase() || "").includes(termo) ||
      (dados.edificacao?.toLowerCase() || "").includes(termo) ||
      (dados.cliente?.razao_social?.toLowerCase() || "").includes(termo) ||
      (dados.bairro?.toLowerCase() || "").includes(termo) ||
      (dados.municipio_uf?.toLowerCase() || "").includes(termo)
    );
  });

  async function handleBaixar(l: Laudo, modo: "scfire" | "cbmsc") {
    setBaixandoId(`${l.id}_${modo}`);
    try {
      const { gerarPdfAlarmeIn12 } = await import("@/lib/in12/pdf-generator");
      await gerarPdfAlarmeIn12(l.dados as AlarmeIn12State, modo);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setBaixandoId(null);
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir este relatório de comissionamento?")) return;
    setExcluindoId(id);
    try {
      await excluirAlarmeIn12(id);
      router.refresh();
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir o relatório.");
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Controles do Topo */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, edificação ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-xl focus:outline-none focus:border-red-500"
          />
        </div>

        <button
          onClick={() => router.push("/documentos/in12/novo")}
          className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Comissionamento
        </button>
      </div>

      {/* Tabela de Relatórios */}
      {filtrados.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
          <FileCheck2 className="w-10 h-10 text-gray-500 mx-auto" />
          <h4 className="text-base font-bold text-white">Nenhum relatório encontrado</h4>
          <p className="text-xs text-gray-400">
            {busca ? "Nenhum resultado corresponde à busca." : "Nenhum comissionamento de alarme preenchido ainda."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/40 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Edificação / Cliente</th>
                  <th className="px-4 py-3">Município / UF</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtrados.map((l) => {
                  const dados = l.dados as AlarmeIn12State;
                  const dataFormatada = l.created_at
                    ? new Date(l.created_at).toLocaleDateString("pt-BR")
                    : "-";

                  return (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-bold text-white font-mono text-xs">
                        {dados.codigo || "SEM CÓDIGO"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{dados.edificacao || dados.cliente?.razao_social || "Sem nome"}</div>
                        <div className="text-xs text-gray-500">{dados.logradouro || dados.bairro || ""}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">{dados.municipio_uf || dados.cidade || "-"}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{dataFormatada}</td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          title="Baixar PDF (Identidade SC Fire)"
                          onClick={() => handleBaixar(l, "scfire")}
                          disabled={baixandoId !== null}
                          className="px-2.5 py-1 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg inline-flex items-center gap-1 transition-all"
                        >
                          {baixandoId === `${l.id}_scfire` ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
                          SC Fire
                        </button>

                        <button
                          title="Baixar PDF (Oficial CBMSC)"
                          onClick={() => handleBaixar(l, "cbmsc")}
                          disabled={baixandoId !== null}
                          className="px-2.5 py-1 text-xs font-semibold text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg inline-flex items-center gap-1 transition-all"
                        >
                          {baixandoId === `${l.id}_cbmsc` ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
                          CBMSC
                        </button>

                        <button
                          title="Editar"
                          onClick={() => router.push(`/documentos/in12/novo?editarId=${l.id}`)}
                          className="p-1.5 text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg inline-flex transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          title="Excluir"
                          onClick={() => handleExcluir(l.id)}
                          disabled={excluindoId === l.id}
                          className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg inline-flex transition-all"
                        >
                          {excluindoId === l.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
