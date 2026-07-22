"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Download, Trash2, FileSignature } from "lucide-react";
import { excluirPibi } from "@/app/actions/in28";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import type { Laudo } from "@/lib/supabase/types";
import type { PibiState } from "@/lib/in28/types";

export function PibiList({ laudos }: { laudos: Laudo[] }) {
  const router = useRouter();
  const [termo, setTermo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const t = termo.toLowerCase();
    return laudos.filter((l) => {
      const dados = l.dados as PibiState;
      return dados.razao_social?.toLowerCase().includes(t) || dados.codigo?.toLowerCase().includes(t) || dados.re?.toLowerCase().includes(t);
    });
  }, [laudos, termo]);

  async function handleExcluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir este PIBI? Essa ação não pode ser desfeita.")) return;
    await excluirPibi(id);
    router.refresh();
  }

  async function handleBaixar(dados: PibiState) {
    setErro(null);
    try {
      const { gerarPdfPibi } = await import("@/lib/in28/pdf-generator");
      await gerarPdfPibi(dados);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Consultar PIBIs</h1>
          <p className="text-sm text-gray-400 mt-1">Histórico de Planos de Implementação de Brigada de Incêndio (IN 28, Anexo C) já emitidos.</p>
        </div>
        <button
          onClick={() => router.push("/documentos/in28/pibi/novo")}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo PIBI
        </button>
      </div>

      {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por código (PIBI-2026-001), razão social ou RE..."
          className="w-full pl-10 pr-3 py-2.5 text-sm text-white bg-white/[0.02] border border-white/[0.08] rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        />
      </div>

      <div className="grid gap-3">
        {filtrados.length === 0 && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center py-12">
            <FileSignature className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-gray-400 font-semibold">Nenhum PIBI emitido ainda</h3>
            <p className="text-xs text-gray-500 mt-1">{termo ? "Tente buscar por outro termo." : "Gere o seu primeiro PIBI no botão acima."}</p>
          </div>
        )}

        {filtrados.map((l) => {
          const dados = l.dados as PibiState;
          return (
            <div key={l.id} className="rounded-xl bg-white/[0.02] border border-white/[0.08] border-l-4 border-l-red-500 p-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-white/[0.04] border border-white/[0.08] rounded-full">{dados.codigo}</span>
                  <h3 className="text-white font-semibold">{dados.razao_social || "Sem razão social"}</h3>
                </div>
                <p className="text-xs text-gray-400">
                  <strong className="text-gray-300">RE:</strong> {dados.re || "-"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => router.push(`/documentos/in28/pibi/novo?editarId=${l.id}`)}
                  title="Editar e gerar novamente"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-amber-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-amber-400 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBaixar(dados)}
                  title="Baixar Anexo C (PDF)"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-emerald-400 transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExcluir(l.id)}
                  title="Excluir"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
