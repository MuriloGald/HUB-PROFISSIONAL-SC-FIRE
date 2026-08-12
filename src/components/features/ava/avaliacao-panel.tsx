"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Flame, HeartPulse, Loader2, TriangleAlert } from "lucide-react";
import { buscarQuestoesAvaliacao, buscarTodasAvaliacoesDoAluno, enviarAvaliacao, type FaseAvaliacao } from "@/app/actions/ava";
import type { AvaliacaoResultado, QuestaoAvaliacao } from "@/lib/ava/types";

interface AvaliacaoPanelProps {
  classId: string;
  studentId: string;
  trainingId: string;
}

export function AvaliacaoPanel({ classId, studentId, trainingId }: AvaliacaoPanelProps) {
  const [faseAtiva, setFaseAtiva] = useState<FaseAvaliacao>("incendio");
  const [carregando, setCarregando] = useState(true);
  const [questoes, setQuestoes] = useState<QuestaoAvaliacao[]>([]);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [resultados, setResultados] = useState<Record<string, AvaliacaoResultado>>({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      setCarregando(true);
      setErro("");
      setRespostas({});
      const [questoesRes, resultadosRes] = await Promise.all([
        buscarQuestoesAvaliacao(trainingId, studentId, faseAtiva, 10),
        buscarTodasAvaliacoesDoAluno(classId, studentId),
      ]);
      setQuestoes(questoesRes.data);
      if (resultadosRes.data) setResultados(resultadosRes.data);
      setCarregando(false);
    })();
  }, [classId, studentId, trainingId, faseAtiva]);

  async function handleEnviar() {
    if (Object.keys(respostas).length < questoes.length) {
      setErro("Responda todas as perguntas antes de enviar.");
      return;
    }
    setErro("");
    setEnviando(true);
    const vetor = questoes.map((_, i) => respostas[i]);
    const res = await enviarAvaliacao(classId, studentId, trainingId, vetor, faseAtiva);
    if ("error" in res && res.error) {
      setErro(res.error);
      setEnviando(false);
      return;
    }
    setResultados((prev) => ({ ...prev, [faseAtiva]: res.data! }));
    setEnviando(false);
  }

  const resultadoAtual = resultados[faseAtiva];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2 text-white pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-red-500" />
          <h3 className="text-base font-bold">Avaliação de Aprendizagem</h3>
        </div>
        <span className="text-xs text-gray-400">Prova em 2 Fases</span>
      </div>

      {/* Seleção de Prova/Fase */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setFaseAtiva("incendio")}
          className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all text-left ${
            faseAtiva === "incendio"
              ? "bg-red-500/10 border-red-500 text-white"
              : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <Flame className="w-4 h-4 text-red-500" />
            <span>Prova 1: Combate a Incêndio</span>
          </div>
          <span className="text-[10px] text-gray-500">
            {resultados.incendio ? `Concluída (${resultados.incendio.acertos}/${resultados.incendio.total} acertos)` : "Pendente (Máx. 10 questões)"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFaseAtiva("primeiros_socorros")}
          className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all text-left ${
            faseAtiva === "primeiros_socorros"
              ? "bg-red-500/10 border-red-500 text-white"
              : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <HeartPulse className="w-4 h-4 text-red-400" />
            <span>Prova 2: Primeiros Socorros</span>
          </div>
          <span className="text-[10px] text-gray-500">
            {resultados.primeiros_socorros
              ? `Concluída (${resultados.primeiros_socorros.acertos}/${resultados.primeiros_socorros.total} acertos)`
              : "Pendente (Máx. 10 questões)"}
          </span>
        </button>
      </div>

      {carregando ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
          <p className="text-xs text-gray-400">Carregando questões...</p>
        </div>
      ) : questoes.length === 0 && !resultadoAtual ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <TriangleAlert className="w-10 h-10 text-amber-500" />
          <p className="text-sm text-gray-300">Não há questões cadastradas para esta fase do curso.</p>
        </div>
      ) : resultadoAtual ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            {faseAtiva === "incendio" ? "Prova de Combate a Incêndio Enviada!" : "Prova de Primeiros Socorros Enviada!"}
          </h3>
          <p className="text-sm text-gray-300">
            Você acertou <strong className="text-white">{resultadoAtual.acertos}</strong> de <strong className="text-white">{resultadoAtual.total}</strong> questões.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
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
            Enviar {faseAtiva === "incendio" ? "Prova de Combate a Incêndio" : "Prova de Primeiros Socorros"}
          </button>
        </div>
      )}
    </div>
  );
}
