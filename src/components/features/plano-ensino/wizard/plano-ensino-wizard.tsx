"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { StepCurso } from "./step-curso";
import { StepIdentificacao } from "./step-identificacao";
import { StepConteudo } from "./step-conteudo";
import { StepAvaliacao } from "./step-avaliacao";
import { StepRevisao } from "./step-revisao";
import type { Training } from "@/lib/supabase/types";
import type { PlanoEnsinoWizardState } from "@/lib/plano-ensino/types";

const DRAFT_KEY = "scfire_plano_ensino_draft";

const STEPS = [{ label: "Curso" }, { label: "Identificação" }, { label: "Conteúdo" }, { label: "Avaliação" }, { label: "Revisão e Geração" }];

interface PlanoEnsinoWizardProps {
  trainings: Pick<Training, "id" | "name" | "total_hours">[];
  initialState?: PlanoEnsinoWizardState;
}

export function PlanoEnsinoWizard({ trainings, initialState }: PlanoEnsinoWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<PlanoEnsinoWizardState>(() => initialState ?? { step: 1 });
  const [hydrated, setHydrated] = useState(Boolean(initialState));

  // Recupera rascunho salvo localmente (se nao estivermos editando um plano ja existente).
  // A leitura precisa acontecer apos o mount (nao da lazy-init do useState) para nao gerar
  // mismatch de hidratacao com o SSR.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (initialState) return;
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        setState(JSON.parse(raw));
      } catch {
        // rascunho corrompido, ignora
      }
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  function avancarPara(step: number, partial: Partial<PlanoEnsinoWizardState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste plano de ensino serão perdidos.")) {
      clearDraft();
      router.push("/plano-ensino");
    }
  }

  const step = state.step ?? 1;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Plano de Ensino</h1>
          <p className="text-sm text-gray-400 mt-1">Siga os passos para gerar o Programa de Matéria de um curso já cadastrado.</p>
        </div>
        <button
          onClick={handleCancelar}
          className="px-3 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <X className="w-3.5 h-3.5" /> Cancelar
        </button>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const active = step >= n;
          const done = step > n;
          return (
            <div key={s.label} className="flex-1 flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  active ? "bg-red-500 text-white" : "bg-white/[0.06] text-gray-500"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : n}
              </div>
              <span className={`text-xs hidden sm:inline ${active ? "text-white font-semibold" : "text-gray-500"}`}>{s.label}</span>
              {n < STEPS.length && <div className={`flex-1 h-px ${done ? "bg-red-500" : "bg-white/[0.08]"}`} />}
            </div>
          );
        })}
      </div>

      {step === 1 && <StepCurso trainings={trainings} state={state} onNext={(partial) => avancarPara(2, partial)} />}

      {step === 2 && <StepIdentificacao state={state} onBack={() => avancarPara(1)} onNext={(partial) => avancarPara(3, partial)} />}

      {step === 3 && <StepConteudo state={state} onBack={() => avancarPara(2)} onNext={(partial) => avancarPara(4, partial)} />}

      {step === 4 && <StepAvaliacao state={state} onBack={() => avancarPara(3)} onNext={(partial) => avancarPara(5, partial)} />}

      {step === 5 && <StepRevisao state={state} onBack={() => avancarPara(4)} onClearDraft={clearDraft} />}
    </div>
  );
}
