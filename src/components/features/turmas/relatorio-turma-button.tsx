"use client";

import { useState } from "react";
import { FileBarChart2, Loader2 } from "lucide-react";
import { buscarRelatorioTurma } from "@/app/actions/turmas";

export function RelatorioTurmaButton({ classId }: { classId: string }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleClick() {
    setErro("");
    setCarregando(true);
    const res = await buscarRelatorioTurma(classId);
    if ("error" in res) {
      setErro(res.error);
      setCarregando(false);
      return;
    }
    const { gerarPdfRelatorioTurma } = await import("@/lib/turmas/pdf-generator");
    await gerarPdfRelatorioTurma(res.data);
    setCarregando(false);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={carregando}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.1] hover:border-red-500/50 hover:bg-white/[0.06] text-xs font-semibold text-gray-300 hover:text-red-400 transition-all disabled:opacity-50"
      >
        {carregando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileBarChart2 className="w-3.5 h-3.5" />}
        {carregando ? "Gerando..." : "Gerar Relatório"}
      </button>
      {erro && <p className="text-[10px] text-red-400 mt-1">{erro}</p>}
    </div>
  );
}
