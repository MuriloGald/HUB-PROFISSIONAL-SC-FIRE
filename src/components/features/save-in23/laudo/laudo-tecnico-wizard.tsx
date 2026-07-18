"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { StepCliente } from "../step-cliente";
import { StepIdentificacaoCap1 } from "./step-identificacao-cap1";
import { StepCapitulo2 } from "./step-capitulo2";
import { StepCapitulo3 } from "./step-capitulo3";
import { StepCapitulo4 } from "./step-capitulo4";
import { StepRevisao } from "./step-revisao";
import type { Cliente } from "@/lib/supabase/types";
import type { ClausulaLaudo, LaudoTecnicoWizardState } from "@/lib/save-in23/types";

const DRAFT_KEY = "scfire_save23_laudo_draft";

const STEPS = [
  { label: "Edificação" },
  { label: "Identificação + Cap. 1" },
  { label: "Cap. 2 — Infraestrutura" },
  { label: "Cap. 3 — Cenários" },
  { label: "Cap. 4 — Conclusão" },
  { label: "Revisão e Geração" },
];

function estadoInicial(clienteIdInicial: string | undefined): LaudoTecnicoWizardState {
  return {
    step: clienteIdInicial ? 2 : 1,
    capitulo1: { historico: [] },
    capitulo2: { clausulas: [] },
    capitulo3: { cenarios: [] },
    capitulo4: {},
  };
}

interface LaudoTecnicoWizardProps {
  clientes: Cliente[];
  clausulasPadrao: { id: string; titulo: string; texto: string }[];
  clienteIdInicial?: string;
  initialState?: LaudoTecnicoWizardState;
}

export function LaudoTecnicoWizard({ clientes, clausulasPadrao, clienteIdInicial, initialState }: LaudoTecnicoWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<LaudoTecnicoWizardState>(() => initialState ?? estadoInicial(clienteIdInicial));
  const [hydrated, setHydrated] = useState(Boolean(initialState));

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
    } else if (clienteIdInicial) {
      const cliente = clientes.find((c) => c.id === clienteIdInicial);
      if (cliente) {
        setState((s) => ({ ...s, step: 2, cliente_id: cliente.id }));
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

  function avancarPara(step: number, partial: Partial<LaudoTecnicoWizardState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste laudo serão perdidos.")) {
      clearDraft();
      router.push("/relatorios/save-in23");
    }
  }

  const step = state.step ?? 1;

  const clausulasParaCap2: ClausulaLaudo[] = state.capitulo2.clausulas.length
    ? state.capitulo2.clausulas
    : clausulasPadrao.map((c) => ({ id: c.id, titulo: c.titulo, texto: c.texto, incluir: false }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Laudo Técnico / Orientação Técnica</h1>
          <p className="text-sm text-gray-400 mt-1">Assistente guiado por capítulos — dispensa do PBD, Art. 6º da IN 23/CBMSC.</p>
        </div>
        <button
          onClick={handleCancelar}
          className="px-3 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <X className="w-3.5 h-3.5" /> Cancelar
        </button>
      </div>

      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const active = step >= n;
          const done = step > n;
          return (
            <div key={s.label} className="flex-1 flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  active ? "bg-red-500 text-white" : "bg-white/[0.06] text-gray-500"
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : n}
              </div>
              {n < STEPS.length && <div className={`flex-1 h-px ${done ? "bg-red-500" : "bg-white/[0.08]"}`} />}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 -mt-4">{STEPS[step - 1]?.label}</p>

      {step === 1 && (
        <StepCliente
          clientes={clientes}
          clienteIdInicial={state.cliente_id}
          redirectToNovoCliente="/relatorios/save-in23/laudos/novo"
          onNext={(clienteId, cliente) => avancarPara(2, { cliente_id: clienteId, cliente })}
        />
      )}

      {step === 2 && <StepIdentificacaoCap1 state={state} onNext={(partial) => avancarPara(3, partial)} />}

      {step === 3 && (
        <StepCapitulo2
          clausulas={clausulasParaCap2}
          onBack={() => avancarPara(2)}
          onNext={(clausulas) => avancarPara(4, { capitulo2: { clausulas } })}
        />
      )}

      {step === 4 && (
        <StepCapitulo3
          paragrafoContextual={state.capitulo3.paragrafoContextual}
          cenarios={state.capitulo3.cenarios}
          onBack={() => avancarPara(3)}
          onNext={(partial) => avancarPara(5, { capitulo3: partial })}
        />
      )}

      {step === 5 && (
        <StepCapitulo4
          texto={state.capitulo4.texto}
          onBack={() => avancarPara(4)}
          onNext={(texto) => avancarPara(6, { capitulo4: { texto } })}
        />
      )}

      {step === 6 && <StepRevisao state={state} onBack={() => avancarPara(5)} onClearDraft={clearDraft} />}
    </div>
  );
}
