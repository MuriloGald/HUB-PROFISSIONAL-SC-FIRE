"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileDown, Loader2, PartyPopper, Plus, X } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { ChecklistCategoria } from "./checklist-categoria";
import { salvarVistoriaManutencao } from "@/app/actions/in04";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import { CATEGORIAS_IN04 } from "@/lib/in04/constants";
import { novoPavimento } from "@/lib/in04/types";
import type { Cliente } from "@/lib/supabase/types";
import type { CategoriaKey, EquipamentoVistoriado, VistoriaManutencaoState } from "@/lib/in04/types";

const DRAFT_KEY = "scfire_in04_manutencao_wizard_draft";
const STEPS = [{ label: "Cliente" }, { label: "Identificação" }, { label: "Vistoria por Pavimento" }, { label: "Revisão" }];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface ManutencaoWizardProps {
  clientes: Cliente[];
  initialState?: VistoriaManutencaoState;
}

export function ManutencaoWizard({ clientes, initialState }: ManutencaoWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<VistoriaManutencaoState>(() => initialState ?? { step: 0, pavimentos: [] });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<VistoriaManutencaoState | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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

  function avancarPara(step: number, partial: Partial<VistoriaManutencaoState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos desta vistoria serão perdidos.")) {
      clearDraft();
      router.push("/documentos/in04");
    }
  }

  function iniciarPavimentos(partial: Partial<VistoriaManutencaoState>) {
    const primeiro = novoPavimento();
    avancarPara(2, { ...partial, pavimentos: [primeiro], pavimentoAtualId: primeiro.id, categoriaAtiva: CATEGORIAS_IN04[0].key });
  }

  function criarPavimento() {
    const novo = novoPavimento(`Pavimento ${state.pavimentos.length + 1}`);
    setState((s) => ({ ...s, pavimentos: [...s.pavimentos, novo], pavimentoAtualId: novo.id, categoriaAtiva: CATEGORIAS_IN04[0].key }));
    window.scrollTo(0, 0);
  }

  function renomearPavimento(id: string, nome: string) {
    setState((s) => ({ ...s, pavimentos: s.pavimentos.map((p) => (p.id === id ? { ...p, nome } : p)) }));
  }

  function removerPavimento(id: string) {
    if (state.pavimentos.length <= 1) return;
    if (!confirm("Remover este pavimento e todos os itens lançados nele?")) return;
    setState((s) => {
      const restantes = s.pavimentos.filter((p) => p.id !== id);
      const pavimentoAtualId = s.pavimentoAtualId === id ? restantes[0]?.id : s.pavimentoAtualId;
      return { ...s, pavimentos: restantes, pavimentoAtualId };
    });
  }

  function onChangeItensPavimento(categoria: CategoriaKey, itens: EquipamentoVistoriado[]) {
    setState((s) => ({
      ...s,
      pavimentos: s.pavimentos.map((p) => (p.id === s.pavimentoAtualId ? { ...p, itens: { ...p.itens, [categoria]: itens } } : p)),
    }));
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarVistoriaManutencao(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar a vistoria.");
        return;
      }
      setSalvo(result.data.dados as unknown as VistoriaManutencaoState);
    } catch (err) {
      console.error("Erro ao salvar a vistoria:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao salvar a vistoria. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  async function handleBaixar() {
    if (!salvo) return;
    setBaixando(true);
    setErro(null);
    try {
      const { gerarPdfVistoriaManutencao } = await import("@/lib/in04/pdf-generator");
      await gerarPdfVistoriaManutencao(salvo);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixando(false);
    }
  }

  function handleConcluir() {
    clearDraft();
    router.push("/documentos/in04/lista");
    router.refresh();
  }

  const step = state.step ?? 0;
  const pavimentoAtual = state.pavimentos.find((p) => p.id === state.pavimentoAtualId) ?? state.pavimentos[0];

  const totalItens = state.pavimentos.reduce((n, p) => n + Object.values(p.itens).reduce((m, arr) => m + arr.length, 0), 0);
  const totalNaoConformidades = state.pavimentos.reduce(
    (n, p) => n + Object.values(p.itens).reduce((m, arr) => m + arr.reduce((k, item) => k + Object.values(item.respostas).filter((r) => r.resposta === "nao").length, 0), 0),
    0
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Nova Vistoria de Manutenção do SMSCI</h1>
          <p className="text-sm text-gray-400 mt-1">IN 04/CBMSC — checklist por pavimento e por sistema preventivo.</p>
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
          const active = step >= i;
          const done = step > i;
          return (
            <div key={s.label} className="flex-1 flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${active ? "bg-red-500 text-white" : "bg-white/[0.06] text-gray-500"}`}>
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${active ? "text-white font-semibold" : "text-gray-500"}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${done ? "bg-red-500" : "bg-white/[0.08]"}`} />}
            </div>
          );
        })}
      </div>

      {step === 0 && (
        <ClientePicker
          clientes={clientes}
          clienteIdInicial={state.cliente_id}
          redirectToNovoCliente="/documentos/in04/novo"
          titulo="Selecione o Cliente"
          onNext={(clienteId, cliente) => avancarPara(1, { cliente_id: clienteId, cliente })}
        />
      )}

      {step === 1 && <StepIdentificacao state={state} onBack={() => avancarPara(0)} onNext={iniciarPavimentos} />}

      {step === 2 && pavimentoAtual && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-3">
            <div className="flex flex-wrap gap-2">
              {state.pavimentos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, pavimentoAtualId: p.id, categoriaAtiva: CATEGORIAS_IN04[0].key }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    p.id === pavimentoAtual.id ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:bg-white/[0.05]"
                  }`}
                >
                  {p.nome || "Sem nome"}
                </button>
              ))}
              <button
                type="button"
                onClick={criarPavimento}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-white/[0.15] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Novo Pavimento
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className={labelClass}>Nome do pavimento atual</label>
              <input
                className={`${inputClass} max-w-xs`}
                value={pavimentoAtual.nome}
                onChange={(e) => renomearPavimento(pavimentoAtual.id, e.target.value)}
              />
              {state.pavimentos.length > 1 && (
                <button type="button" onClick={() => removerPavimento(pavimentoAtual.id)} className="text-xs text-red-400 hover:text-red-300 font-semibold">
                  Remover pavimento
                </button>
              )}
            </div>
          </div>

          <ChecklistCategoria
            pavimento={pavimentoAtual}
            categoriaAtiva={state.categoriaAtiva ?? CATEGORIAS_IN04[0].key}
            onSetCategoriaAtiva={(key) => setState((s) => ({ ...s, categoriaAtiva: key }))}
            onChangeItens={onChangeItensPavimento}
          />

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => avancarPara(1)}
              className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={criarPavimento}
                className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Concluir Pavimento e Ir para o Próximo
              </button>
              <button
                type="button"
                onClick={() => avancarPara(3)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                Finalizar Vistoria e Revisar <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">{salvo ? "Vistoria Salva!" : "Pronto para Salvar a Vistoria!"}</h3>
            <p className="text-sm text-gray-400">{salvo ? "Baixe o relatório em PDF abaixo." : "Revise o resumo abaixo antes de salvar."}</p>
          </div>

          {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

          <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Cliente:</strong> {state.cliente?.razao_social || "-"}</p>
            <p><strong className="text-white">Vistoriador:</strong> {state.vistoriador || "-"}</p>
            <p><strong className="text-white">Responsável Técnico:</strong> {state.rt_nome || "-"}</p>
            <p><strong className="text-white">Pavimentos vistoriados:</strong> {state.pavimentos.length}</p>
            <p><strong className="text-white">Itens lançados:</strong> {totalItens}</p>
            <p>
              <strong className="text-white">Não conformidades:</strong>{" "}
              <span className={totalNaoConformidades > 0 ? "text-amber-400 font-semibold" : ""}>{totalNaoConformidades}</span>
            </p>
          </div>

          {!salvo && (
            <div className="space-y-1.5">
              <label className={labelClass}>Observações gerais</label>
              <textarea
                rows={3}
                className={inputClass}
                value={state.observacoesGerais ?? ""}
                onChange={(e) => setState((s) => ({ ...s, observacoesGerais: e.target.value }))}
              />
            </div>
          )}

          {!salvo ? (
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => avancarPara(2)}
                className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar e Editar
              </button>
              <button
                type="button"
                onClick={handleSalvar}
                disabled={salvando}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {salvando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Salvar Relatório
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleBaixar}
                  disabled={baixando}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {baixando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  Baixar Relatório (PDF)
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleConcluir}
                  className="px-4 py-2 border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-white hover:text-emerald-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <PartyPopper className="w-3.5 h-3.5" /> Concluir e Voltar para Consultar Vistorias
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepIdentificacao({
  state,
  onBack,
  onNext,
}: {
  state: VistoriaManutencaoState;
  onBack: () => void;
  onNext: (partial: Partial<VistoriaManutencaoState>) => void;
}) {
  const [form, setForm] = useState({
    vistoriador: state.vistoriador ?? "",
    rt_nome: state.rt_nome ?? "",
    rt_registro: state.rt_registro ?? "",
    data_vistoria: state.data_vistoria ?? new Date().toISOString().slice(0, 10),
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext(form);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Identificação da vistoria</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Vistoriador</label>
          <input className={inputClass} value={form.vistoriador} onChange={(e) => update("vistoriador", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Data da vistoria</label>
          <input type="date" className={inputClass} value={form.data_vistoria} onChange={(e) => update("data_vistoria", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Responsável Técnico</label>
          <input className={inputClass} value={form.rt_nome} onChange={(e) => update("rt_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº de registro do RT</label>
          <input className={inputClass} value={form.rt_registro} onChange={(e) => update("rt_registro", e.target.value)} />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Iniciar Vistoria <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
