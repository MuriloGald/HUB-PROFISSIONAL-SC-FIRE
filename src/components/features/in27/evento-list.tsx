"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Download, Trash2, FileSignature } from "lucide-react";
import { excluirEventoPirotecnico } from "@/app/actions/in27";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import type { Laudo } from "@/lib/supabase/types";
import type { EventoPirotecnicoState } from "@/lib/in27/types";

export function EventoList({ laudos }: { laudos: Laudo[] }) {
  const router = useRouter();
  const [termo, setTermo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [baixando, setBaixando] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const t = termo.toLowerCase();
    return laudos.filter((l) => {
      const dados = l.dados as EventoPirotecnicoState;
      return dados.promotor_nome?.toLowerCase().includes(t) || dados.codigo?.toLowerCase().includes(t);
    });
  }, [laudos, termo]);

  async function handleExcluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir este evento? Essa ação não pode ser desfeita.")) return;
    await excluirEventoPirotecnico(id);
    router.refresh();
  }

  async function handleBaixar(id: string, dados: EventoPirotecnicoState, tipo: "a" | "b" | "c") {
    setErro(null);
    setBaixando(`${id}-${tipo}`);
    try {
      const { gerarPdfRequerimento, gerarPdfPlanoSeguranca, gerarPdfCroqui } = await import("@/lib/in27/pdf-generator");
      if (tipo === "a") await gerarPdfRequerimento(dados);
      else if (tipo === "b") await gerarPdfPlanoSeguranca(dados);
      else await gerarPdfCroqui(dados);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixando(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Consultar Eventos Pirotécnicos</h1>
          <p className="text-sm text-gray-400 mt-1">Histórico de eventos pirotécnicos (IN 27, Anexos A/B/C) já cadastrados.</p>
        </div>
        <button
          onClick={() => router.push("/documentos/in27/novo")}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Evento
        </button>
      </div>

      {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por código (PIRO-2026-001) ou promotor..."
          className="w-full pl-10 pr-3 py-2.5 text-sm text-white bg-white/[0.02] border border-white/[0.08] rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        />
      </div>

      <div className="grid gap-3">
        {filtrados.length === 0 && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center py-12">
            <FileSignature className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-gray-400 font-semibold">Nenhum evento cadastrado ainda</h3>
            <p className="text-xs text-gray-500 mt-1">{termo ? "Tente buscar por outro termo." : "Cadastre o seu primeiro evento no botão acima."}</p>
          </div>
        )}

        {filtrados.map((l) => {
          const dados = l.dados as EventoPirotecnicoState;
          return (
            <div key={l.id} className="rounded-xl bg-white/[0.02] border border-white/[0.08] border-l-4 border-l-red-500 p-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold text-gray-400 bg-white/[0.04] border border-white/[0.08] rounded-full">{dados.codigo}</span>
                  <h3 className="text-white font-semibold">{dados.promotor_nome || "Sem promotor"}</h3>
                </div>
                <p className="text-xs text-gray-400">
                  <strong className="text-gray-300">Data:</strong> {dados.data_evento ? new Date(dados.data_evento).toLocaleDateString("pt-BR") : "-"} |{" "}
                  <strong className="text-gray-300">Blaster:</strong> {dados.blaster_nome || "-"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => router.push(`/documentos/in27/novo?editarId=${l.id}`)}
                  title="Editar e gerar novamente"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-amber-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-amber-400 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBaixar(l.id, dados, "a")}
                  disabled={baixando !== null}
                  title="Baixar Anexo A — Requerimento"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-emerald-400 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBaixar(l.id, dados, "b")}
                  disabled={baixando !== null}
                  title="Baixar Anexo B — Plano de Segurança"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-blue-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-blue-400 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBaixar(l.id, dados, "c")}
                  disabled={baixando !== null}
                  title="Baixar Anexo C — Croqui"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-purple-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-purple-400 transition-all disabled:opacity-50"
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
