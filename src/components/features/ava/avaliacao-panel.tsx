"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Loader2, TriangleAlert } from "lucide-react";
import { buscarQuestoesAvaliacao, buscarAvaliacaoDoAluno, enviarAvaliacao } from "@/app/actions/ava";
import type { AvaliacaoResultado, QuestaoAvaliacao } from "@/lib/ava/types";

interface AvaliacaoPanelProps {
  classId: string;
  studentId: string;
  trainingId: string;
}

export function AvaliacaoPanel({ classId, studentId, trainingId }: AvaliacaoPanelProps) {
  const [carregando, setCarregando] = useState(true);
  const [questoes, setQuestoes] = useState<QuestaoAvaliacao[]>([]);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<AvaliacaoResultado | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    (async () => {
      const [questoesRes, resultadoRes] = await Promise.all([buscarQuestoesAvaliacao(trainingId), buscarAvaliacaoDoAluno(classId, studentId)]);
      setQuestoes(questoesRes.data);
      if (resultadoRes.data) setResultado(resultadoRes.data);
      setCarregando(false);
    })();
  }, [classId, studentId, trainingId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleEnviar() {
    if (Object.keys(respostas).length < questoes.length) {
      setErro("Responda todas as perguntas antes de enviar.");
      return;
    }
    setErro("");
    setEnviando(true);
    const vetor = questoes.map((_, i) => respostas[i]);
    const res = await enviarAvaliacao(classId, studentId, trainingId, vetor);
    if ("error" in res && res.error) {
      setErro(res.error);
      setEnviando(false);
      return;
    }
    setResultado(res.data!);
    setEnviando(false);
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
        <p className="text-xs text-gray-400">Carregando avaliação...</p>
      </div>
    );
  }

  if (questoes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <TriangleAlert className="w-10 h-10 text-amber-500" />
        <p className="text-sm text-gray-300">A avaliação deste curso ainda não foi cadastrada pelo instrutor.</p>
      </div>
    );
  }

  if (resultado) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        <h3 className="text-base font-bold text-white">Avaliação enviada!</h3>
        <p className="text-sm text-gray-300">
          Você acertou <strong className="text-white">{resultado.acertos}</strong> de <strong className="text-white">{resultado.total}</strong> questões.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-white">
        <ClipboardList className="w-5 h-5 text-red-500" />
        <h3 className="text-base font-bold">Avaliação</h3>
      </div>

      {questoes.map((q, qi) => (
        <div key={qi} className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3">
          <p className="text-sm text-gray-200 font-semibold">
            {qi + 1}. {q.pergunta}
          </p>
          <div className="space-y-2">
            {q.opcoes.map((o, oi) => (
              <label
                key={oi}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                  respostas[qi] === oi ? "bg-red-500/10 border-red-500 text-white" : "border-white/[0.08] text-gray-300 hover:bg-white/[0.03]"
                }`}
              >
                <input
                  type="radio"
                  name={`questao-${qi}`}
                  checked={respostas[qi] === oi}
                  onChange={() => setRespostas((r) => ({ ...r, [qi]: oi }))}
                  className="accent-red-500"
                />
                {o.texto}
              </label>
            ))}
          </div>
        </div>
      ))}

      {erro && <p className="text-xs text-red-400">{erro}</p>}

      <button
        onClick={handleEnviar}
        disabled={enviando}
        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Enviar Avaliação
      </button>
    </div>
  );
}
