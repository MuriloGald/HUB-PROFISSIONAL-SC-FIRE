"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, X } from "lucide-react";
import { StepCliente } from "../step-cliente";
import { SetorForm } from "./setor-form";
import { StepRevisao } from "./step-revisao";
import type { Cliente } from "@/lib/supabase/types";
import type { SetorVistoria, VistoriaWizardState } from "@/lib/save-in23/types";

const DRAFT_KEY = "scfire_save23_vistoria_draft";

const STEPS = [{ label: "Edificação" }, { label: "Vistoria por Setor" }, { label: "Revisão e Geração" }];

function novoSetor(): SetorVistoria {
  return {
    id: crypto.randomUUID(),
    nome: "",
    ventilacao: {},
    alteracoes: [],
    imagens: [],
  };
}

interface VistoriaWizardProps {
  clientes: Cliente[];
  clienteIdInicial?: string;
  initialState?: VistoriaWizardState;
}

export function VistoriaWizard({ clientes, clienteIdInicial, initialState }: VistoriaWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<VistoriaWizardState>(
    () => initialState ?? { step: clienteIdInicial ? 2 : 1, setores: [] }
  );
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
        setState({
          step: 2,
          cliente_id: cliente.id,
          setores: [],
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

  function avancarPara(step: number, partial: Partial<VistoriaWizardState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos desta vistoria serão perdidos.")) {
      clearDraft();
      router.push("/relatorios/save-in23");
    }
  }

  function atualizarSetor(id: string, setor: SetorVistoria) {
    setState((s) => ({ ...s, setores: s.setores.map((x) => (x.id === id ? setor : x)) }));
  }

  function removerSetor(id: string) {
    setState((s) => ({ ...s, setores: s.setores.filter((x) => x.id !== id) }));
  }

  const step = state.step ?? 1;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Nova Vistoria de Campo</h1>
          <p className="text-sm text-gray-400 mt-1">Avaliação de dispensa do PBD por setor — Art. 6º da IN 23/CBMSC.</p>
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
          redirectToNovoCliente="/relatorios/save-in23/vistorias/nova"
          onNext={(clienteId, cliente) => avancarPara(2, { cliente_id: clienteId, cliente })}
        />
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Identificação da vistoria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vistoriador</label>
                <input
                  className="w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500"
                  value={state.vistoriador ?? ""}
                  onChange={(e) => setState((s) => ({ ...s, vistoriador: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Responsável Técnico</label>
                <input
                  className="w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500"
                  value={state.respTecnico ?? ""}
                  onChange={(e) => setState((s) => ({ ...s, respTecnico: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {state.setores.map((setor, i) => (
            <SetorForm
              key={setor.id}
              setor={setor}
              index={i}
              preexistente={state.cliente?.preexistente}
              onChange={(s) => atualizarSetor(setor.id, s)}
              onRemove={() => removerSetor(setor.id)}
            />
          ))}

          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, setores: [...s.setores, novoSetor()] }))}
            className="w-full py-3 border border-dashed border-white/[0.15] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar setor
          </button>

          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Observações gerais</label>
            <textarea
              rows={3}
              placeholder="Croqui, fotos, pendências gerais…"
              className="w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500"
              value={state.observacoesGerais ?? ""}
              onChange={(e) => setState((s) => ({ ...s, observacoesGerais: e.target.value }))}
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => avancarPara(1)}
              className="px-4 py-2 border border-white/[0.08] hover:border-white/20 text-gray-300 text-xs font-semibold rounded-lg transition-all"
            >
              Voltar
            </button>
            <button
              disabled={!state.setores.length}
              onClick={() => avancarPara(3)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              Avançar para Revisão
            </button>
          </div>
        </div>
      )}

      {step === 3 && <StepRevisao state={state} onBack={() => avancarPara(2)} onClearDraft={clearDraft} />}
    </div>
  );
}
