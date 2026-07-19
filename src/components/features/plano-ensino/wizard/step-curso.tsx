"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { listarSubtemasDoCurso } from "@/app/actions/plano-ensino";
import { buscarCurso } from "@/app/actions/subtemas";
import type { Training } from "@/lib/supabase/types";
import type { PlanoEnsinoWizardState, SubtemaPlano, TrainingSnapshot } from "@/lib/plano-ensino/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

type Modo = "cadastrado" | "avulso";

interface StepCursoProps {
  trainings: Pick<Training, "id" | "name" | "total_hours">[];
  state: PlanoEnsinoWizardState;
  onNext: (partial: Partial<PlanoEnsinoWizardState>) => void;
}

export function StepCurso({ trainings, state, onNext }: StepCursoProps) {
  const [modo, setModo] = useState<Modo>(() => (state.training_id && trainings.some((t) => t.id === state.training_id) ? "cadastrado" : state.training ? "avulso" : "cadastrado"));
  const [trainingId, setTrainingId] = useState(state.training_id ?? "");
  const [nomeAvulso, setNomeAvulso] = useState(modo === "avulso" ? state.training?.name ?? "" : "");
  const [cargaHorariaAvulsa, setCargaHorariaAvulsa] = useState(modo === "avulso" ? String(state.training?.total_hours ?? "") : "");
  const [turmaPeriodo, setTurmaPeriodo] = useState(state.turma_periodo ?? "");
  const [instrutor, setInstrutor] = useState(state.instrutor_responsavel ?? "");
  const [carregando, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleAvancar() {
    if (modo === "avulso") {
      if (!nomeAvulso.trim()) return;
      const trainingSnapshot: TrainingSnapshot = {
        id: `avulso-${Date.now()}`,
        name: nomeAvulso.trim(),
        total_hours: Number(cargaHorariaAvulsa) || 0,
      };
      onNext({
        training_id: trainingSnapshot.id,
        training: trainingSnapshot,
        turma_periodo: turmaPeriodo,
        instrutor_responsavel: instrutor,
        conteudo_programatico: state.training_id === trainingSnapshot.id ? state.conteudo_programatico ?? [] : [],
      });
      return;
    }

    const training = trainings.find((t) => t.id === trainingId);
    if (!training) return;

    setErro(null);
    startTransition(async () => {
      const trainingSnapshot: TrainingSnapshot = { id: training.id, name: training.name, total_hours: training.total_hours };
      let conteudo: SubtemaPlano[] = state.training_id === trainingId ? state.conteudo_programatico ?? [] : [];
      let template: Partial<PlanoEnsinoWizardState> = {};

      if (state.training_id !== trainingId) {
        const [resultSubtemas, resultCurso] = await Promise.all([listarSubtemasDoCurso(trainingId), buscarCurso(trainingId)]);
        if ("error" in resultSubtemas && resultSubtemas.error) {
          setErro(resultSubtemas.error);
          return;
        }
        conteudo = resultSubtemas.data;

        // Pré-preenche ementa/objetivos/metodologia/bibliografia com o template cadastrado
        // no curso — só na primeira vez que esse curso é selecionado neste plano, pra não
        // sobrescrever o que o usuário já editou manualmente ao ir e voltar no wizard.
        if (resultCurso.data) {
          const c = resultCurso.data;
          template = {
            ementa: c.ementa ?? "",
            objetivo_geral: c.objetivo_geral ?? "",
            objetivos_especificos: c.objetivos_especificos ?? [],
            metodologia: c.metodologia ?? "",
            recursos_didaticos: c.recursos_didaticos ?? "",
            criterios_avaliacao: c.criterios_avaliacao ?? "",
            bibliografia_basica: c.bibliografia_basica ?? [],
            bibliografia_complementar: c.bibliografia_complementar ?? [],
          };
        }
      }

      onNext({
        training_id: trainingId,
        training: trainingSnapshot,
        turma_periodo: turmaPeriodo,
        instrutor_responsavel: instrutor,
        conteudo_programatico: conteudo,
        ...template,
      });
    });
  }

  const avancarDesabilitado = modo === "cadastrado" ? !trainingId || carregando : !nomeAvulso.trim();

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Selecione o Curso</h3>

      {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setModo("cadastrado")}
          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
            modo === "cadastrado" ? "bg-red-500/10 border-red-500/50 text-red-400" : "border-white/[0.08] text-gray-400 hover:bg-white/[0.04]"
          }`}
        >
          Curso cadastrado
        </button>
        <button
          type="button"
          onClick={() => setModo("avulso")}
          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
            modo === "avulso" ? "bg-red-500/10 border-red-500/50 text-red-400" : "border-white/[0.08] text-gray-400 hover:bg-white/[0.04]"
          }`}
        >
          Curso avulso (uma vez só)
        </button>
      </div>

      {modo === "cadastrado" ? (
        <div className="space-y-1.5">
          <label className={labelClass}>Curso cadastrado em Treinamentos</label>
          <select value={trainingId} onChange={(e) => setTrainingId(e.target.value)} className={inputClass}>
            <option value="" className="bg-[#111625]">
              -- Selecione --
            </option>
            {trainings.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#111625]">
                {t.name} ({t.total_hours}h)
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Não fica vinculado a um curso do cadastro de Treinamentos — o conteúdo programático começa em branco e você monta manualmente no próximo passo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Nome do Curso/Matéria</label>
              <input value={nomeAvulso} onChange={(e) => setNomeAvulso(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Carga Horária (h)</label>
              <input type="number" min={0} value={cargaHorariaAvulsa} onChange={(e) => setCargaHorariaAvulsa(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Turma / Período</label>
          <input value={turmaPeriodo} onChange={(e) => setTurmaPeriodo(e.target.value)} placeholder="Ex.: Turma 2026-02" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Instrutor Responsável</label>
          <input value={instrutor} onChange={(e) => setInstrutor(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          disabled={avancarDesabilitado}
          onClick={handleAvancar}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
        >
          {carregando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
          Avançar
        </button>
      </div>
    </div>
  );
}
