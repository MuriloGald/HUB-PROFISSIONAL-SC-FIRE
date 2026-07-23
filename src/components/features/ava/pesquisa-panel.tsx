"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Star, MessageSquareText } from "lucide-react";
import { buscarPesquisaDoAluno, enviarPesquisaSatisfacao } from "@/app/actions/ava";
import { PERGUNTAS_PESQUISA_SATISFACAO } from "@/lib/ava/types";

interface PesquisaPanelProps {
  classId: string;
  studentId: string;
}

function EstrelasInput({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
          <Star className={`w-6 h-6 transition-colors ${n <= valor ? "fill-amber-400 text-amber-400" : "text-gray-600"}`} />
        </button>
      ))}
    </div>
  );
}

export function PesquisaPanel({ classId, studentId }: PesquisaPanelProps) {
  const [carregando, setCarregando] = useState(true);
  const [notas, setNotas] = useState<Record<number, number>>({});
  const [comentario, setComentario] = useState("");
  const [enviada, setEnviada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    buscarPesquisaDoAluno(classId, studentId).then((res) => {
      if (res.data) setEnviada(true);
      setCarregando(false);
    });
  }, [classId, studentId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleEnviar() {
    if (Object.keys(notas).length < PERGUNTAS_PESQUISA_SATISFACAO.length) {
      setErro("Avalie todas as perguntas antes de enviar.");
      return;
    }
    setErro("");
    setEnviando(true);
    const vetor = PERGUNTAS_PESQUISA_SATISFACAO.map((_, i) => notas[i]);
    const res = await enviarPesquisaSatisfacao(classId, studentId, vetor, comentario);
    if ("error" in res && res.error) {
      setErro(res.error);
      setEnviando(false);
      return;
    }
    setEnviada(true);
    setEnviando(false);
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
        <p className="text-xs text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (enviada) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        <h3 className="text-base font-bold text-white">Obrigado pela sua avaliação!</h3>
        <p className="text-sm text-gray-400">Sua opinião ajuda a melhorar os próximos treinamentos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-white">
        <MessageSquareText className="w-5 h-5 text-red-500" />
        <h3 className="text-base font-bold">Pesquisa de Satisfação</h3>
      </div>

      {PERGUNTAS_PESQUISA_SATISFACAO.map((pergunta, i) => (
        <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-gray-200">{pergunta}</p>
          <EstrelasInput valor={notas[i] ?? 0} onChange={(v) => setNotas((n) => ({ ...n, [i]: v }))} />
        </div>
      ))}

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Comentários e sugestões (opcional)</label>
        <textarea
          rows={3}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="w-full px-3 py-2 text-sm text-white bg-white/[0.05] border border-white/[0.1] rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
        />
      </div>

      {erro && <p className="text-xs text-red-400">{erro}</p>}

      <button
        onClick={handleEnviar}
        disabled={enviando}
        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Enviar Pesquisa
      </button>
    </div>
  );
}
