"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { StepCliente } from "./step-cliente";
import { StepInfoBase } from "./step-info-base";
import { FormsPequeno } from "./forms-pequeno";
import { FormsMedio } from "./forms-medio";
import { FormsGrande } from "./forms-grande";
import { StepRevisao } from "./step-revisao";
import type { Cliente } from "@/lib/supabase/types";
import type { EventoWizardState, Respostas } from "@/lib/laudos/types";

const DRAFT_KEY = "scfire_wizard_draft";

const STEPS = [
  { label: "Cliente" },
  { label: "Informações Base" },
  { label: "Questionário" },
  { label: "Revisão e Geração" },
];

interface EventoWizardProps {
  clientes: Cliente[];
  clienteIdInicial?: string;
  initialState?: EventoWizardState;
}

export function EventoWizard({ clientes, clienteIdInicial, initialState }: EventoWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<EventoWizardState>(() => initialState ?? { step: clienteIdInicial ? 2 : 1 });
  const [hydrated, setHydrated] = useState(Boolean(initialState));

  // Recupera rascunho salvo localmente (se nao estivermos editando um laudo ja existente).
  // O localStorage so existe no browser, entao essa leitura precisa acontecer apos o mount
  // (nao da lazy-init do useState) para nao gerar mismatch de hidratacao com o SSR.
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
        setState({
          step: 2,
          cliente_id: cliente.id,
          cliente: {
            id: cliente.id,
            razao_social: cliente.razao_social ?? cliente.nome,
            cnpj: cliente.cnpj_cpf ?? undefined,
            nome_responsavel: cliente.responsavel_nome ?? undefined,
            email: cliente.email ?? undefined,
            telefone: cliente.telefone ?? undefined,
            logradouro: cliente.logradouro ?? undefined,
            numero: cliente.numero ?? undefined,
            bairro: cliente.bairro ?? undefined,
            complemento: cliente.complemento ?? undefined,
            cidade: cliente.cidade ?? undefined,
            estado: cliente.estado ?? undefined,
            cep: cliente.cep ?? undefined,
          },
        });
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

  function avancarPara(step: number, partial: Partial<EventoWizardState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste evento serão perdidos.")) {
      clearDraft();
      router.push("/laudos");
    }
  }

  const step = state.step ?? 1;

  function renderQuestionario() {
    if (state.porteFinal === "pequeno") {
      return (
        <FormsPequeno
          respostas={state.respostas_pequeno ?? {}}
          onBack={(respostas) => avancarPara(2, { respostas_pequeno: respostas })}
          onNext={(respostas: Respostas) => avancarPara(4, { respostas_pequeno: respostas })}
        />
      );
    }
    if (state.porteFinal === "medio") {
      return (
        <FormsMedio
          respostas={state.respostas_medio ?? {}}
          onBack={(respostas) => avancarPara(2, { respostas_medio: respostas })}
          onNext={(respostas) => avancarPara(4, { respostas_medio: respostas })}
        />
      );
    }
    return (
      <FormsGrande
        respostas={state.respostas_grande ?? {}}
        onBack={(respostas) => avancarPara(2, { respostas_grande: respostas })}
        onNext={(respostas) => avancarPara(4, { respostas_grande: respostas })}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Laudo de Evento</h1>
          <p className="text-sm text-gray-400 mt-1">Siga os passos para emitir os documentos (IN 24 CBMSC).</p>
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

      {step === 1 && (
        <StepCliente
          clientes={clientes}
          clienteIdInicial={state.cliente_id}
          onNext={(clienteId, cliente) => avancarPara(2, { cliente_id: clienteId, cliente })}
        />
      )}

      {step === 2 && <StepInfoBase state={state} onBack={() => avancarPara(1)} onNext={(partial) => avancarPara(3, partial)} />}

      {step === 3 && renderQuestionario()}

      {step === 4 && <StepRevisao state={state} onBack={() => avancarPara(3)} onClearDraft={clearDraft} />}
    </div>
  );
}
