"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, FileDown, Loader2, PartyPopper } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { ChecklistGenerico } from "@/components/features/shared/resposta-toggle";
import { salvarComissionamentoElevador } from "@/app/actions/in09";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import { SECOES_ELEVADOR } from "@/lib/in09/constants";
import type { Cliente } from "@/lib/supabase/types";
import type { ComissionamentoElevadorState, RespostaChecklist3 } from "@/lib/in09/types";

const DRAFT_KEY = "scfire_in09_elevador_wizard_draft";
const STEPS = [{ label: "Identificação" }, { label: "Geral/Evacuação" }, { label: "Painéis/Controles" }, { label: "Painel Interno/Notas" }, { label: "Revisão" }];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface ElevadorWizardProps {
  clientes: Cliente[];
  clienteIdInicial?: string;
  initialState?: ComissionamentoElevadorState;
}

export function ElevadorWizard({ clientes, clienteIdInicial, initialState }: ElevadorWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<ComissionamentoElevadorState>(() => initialState ?? { step: clienteIdInicial ? 1 : 0, respostas: {} });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<ComissionamentoElevadorState | null>(null);
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
    } else if (clienteIdInicial) {
      const cliente = clientes.find((c) => c.id === clienteIdInicial);
      if (cliente) {
        setState({
          step: 1,
          respostas: {},
          cliente_id: cliente.id,
          cliente: {
            id: cliente.id,
            razao_social: cliente.razao_social ?? cliente.nome,
            cnpj: cliente.cnpj_cpf ?? undefined,
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
          logradouro: cliente.logradouro ?? undefined,
          numero: cliente.numero ?? undefined,
          complemento: cliente.complemento ?? undefined,
          bairro: cliente.bairro ?? undefined,
          municipio: cliente.cidade ? `${cliente.cidade} - ${cliente.estado || "SC"}` : undefined,
          re: cliente.re ?? undefined,
          responsavel_imovel_nome: cliente.razao_social ?? cliente.nome,
          responsavel_imovel_email: cliente.email ?? undefined,
          responsavel_imovel_fone: cliente.telefone ?? undefined,
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

  function avancarPara(step: number, partial: Partial<ComissionamentoElevadorState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste relatório serão perdidos.")) {
      clearDraft();
      router.push("/documentos/in09");
    }
  }

  function setResposta(chave: string, resposta: string) {
    setState((s) => ({ ...s, respostas: { ...s.respostas, [chave]: resposta as RespostaChecklist3 } }));
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarComissionamentoElevador(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o relatório.");
        return;
      }
      setSalvo(result.data.dados as ComissionamentoElevadorState);
    } catch (err) {
      console.error("Erro ao salvar o relatório:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao salvar o relatório. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  async function handleBaixar() {
    if (!salvo) return;
    setBaixando(true);
    setErro(null);
    try {
      const { gerarPdfComissionamentoElevador } = await import("@/lib/in09/pdf-generator");
      await gerarPdfComissionamentoElevador(salvo);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixando(false);
    }
  }

  function handleConcluir() {
    clearDraft();
    router.push("/documentos/in09/lista");
    router.refresh();
  }

  const step = state.step ?? 0;
  const respostas = state.respostas || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Relatório de Comissionamento do Elevador</h1>
          <p className="text-sm text-gray-400 mt-1">IN 09/CBMSC — Anexo E — Elevador de Emergência.</p>
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
          redirectToNovoCliente="/documentos/in09/novo"
          titulo="Selecione o Responsável pelo Imóvel"
          onNext={(clienteId, cliente) =>
            avancarPara(1, {
              cliente_id: clienteId,
              cliente,
              logradouro: cliente.logradouro,
              numero: cliente.numero,
              complemento: cliente.complemento,
              bairro: cliente.bairro,
              municipio: cliente.cidade ? `${cliente.cidade} - ${cliente.estado || "SC"}` : undefined,
              re: cliente.re,
              responsavel_imovel_nome: cliente.razao_social,
              responsavel_imovel_email: cliente.email,
              responsavel_imovel_fone: cliente.telefone,
            })
          }
        />
      )}

      {step === 1 && <StepIdentificacao state={state} onBack={() => avancarPara(0)} onNext={(partial) => avancarPara(2, partial)} />}

      {step === 2 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <ChecklistGenerico titulo={`${SECOES_ELEVADOR[0].numero}. ${SECOES_ELEVADOR[0].titulo}`} itens={SECOES_ELEVADOR[0].itens} respostas={respostas} onChange={setResposta} comNa />
          <ChecklistGenerico titulo={`${SECOES_ELEVADOR[1].numero}. ${SECOES_ELEVADOR[1].titulo}`} itens={SECOES_ELEVADOR[1].itens} respostas={respostas} onChange={setResposta} comNa />
          <div className="flex justify-between pt-2">
            <button type="button" onClick={() => avancarPara(1)} className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <button type="button" onClick={() => avancarPara(3)} className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
              Avançar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <ChecklistGenerico titulo={`${SECOES_ELEVADOR[2].numero}. ${SECOES_ELEVADOR[2].titulo}`} itens={SECOES_ELEVADOR[2].itens} respostas={respostas} onChange={setResposta} comNa />
          <ChecklistGenerico titulo={`${SECOES_ELEVADOR[3].numero}. ${SECOES_ELEVADOR[3].titulo}`} itens={SECOES_ELEVADOR[3].itens} respostas={respostas} onChange={setResposta} comNa />
          <div className="flex justify-between pt-2">
            <button type="button" onClick={() => avancarPara(2)} className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <button type="button" onClick={() => avancarPara(4)} className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
              Avançar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <StepFinal state={state} respostas={respostas} onChangeResposta={setResposta} onBack={() => avancarPara(3)} onNext={(partial) => avancarPara(5, partial)} />
      )}

      {step === 5 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">{salvo ? "Relatório Salvo!" : "Pronto para Salvar o Relatório!"}</h3>
            <p className="text-sm text-gray-400">{salvo ? "Baixe o PDF abaixo." : "Revise os dados abaixo antes de salvar."}</p>
          </div>

          {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

          <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Responsável pelo imóvel:</strong> {state.responsavel_imovel_nome || "-"}</p>
            <p><strong className="text-white">RE:</strong> {state.re || "-"}</p>
            <p><strong className="text-white">Qtd. de elevadores:</strong> {state.qtd_elevadores || "-"}</p>
            <p><strong className="text-white">Itens avaliados:</strong> {Object.values(respostas).filter((v) => v).length} de {SECOES_ELEVADOR.reduce((n, s) => n + s.itens.length, 0)}</p>
          </div>

          {!salvo ? (
            <div className="flex justify-center gap-3 pt-2">
              <button type="button" onClick={() => avancarPara(4)} className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
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
                  Baixar Anexo E (PDF)
                </button>
              </div>
              <div className="flex justify-center">
                <button type="button" onClick={handleConcluir} className="px-4 py-2 border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-white hover:text-emerald-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
                  <PartyPopper className="w-3.5 h-3.5" /> Concluir e Voltar para Consultar Relatórios
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
  state: ComissionamentoElevadorState;
  onBack: () => void;
  onNext: (partial: Partial<ComissionamentoElevadorState>) => void;
}) {
  const [form, setForm] = useState({
    logradouro: state.logradouro ?? "",
    numero: state.numero ?? "",
    complemento: state.complemento ?? "",
    bairro: state.bairro ?? "",
    municipio: state.municipio ?? "",
    re: state.re ?? "",
    responsavel_imovel_nome: state.responsavel_imovel_nome ?? "",
    responsavel_imovel_email: state.responsavel_imovel_email ?? "",
    responsavel_imovel_fone: state.responsavel_imovel_fone ?? "",
    rt_nome: state.rt_nome ?? "",
    rt_registro: state.rt_registro ?? "",
    rt_email: state.rt_email ?? "",
    rt_fone: state.rt_fone ?? "",
    qtd_elevadores: state.qtd_elevadores ?? "",
    altura_edificacao: state.altura_edificacao ?? "",
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
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Endereço</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>Logradouro</label>
          <input className={inputClass} value={form.logradouro} onChange={(e) => update("logradouro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº</label>
          <input className={inputClass} value={form.numero} onChange={(e) => update("numero", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Complemento</label>
          <input className={inputClass} value={form.complemento} onChange={(e) => update("complemento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input className={inputClass} value={form.bairro} onChange={(e) => update("bairro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Município-UF</label>
          <input className={inputClass} value={form.municipio} onChange={(e) => update("municipio", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>RE</label>
          <input className={inputClass} value={form.re} onChange={(e) => update("re", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Qtd. de Elevadores de Emergência</label>
          <input className={inputClass} value={form.qtd_elevadores} onChange={(e) => update("qtd_elevadores", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Altura da edificação (m)</label>
          <input className={inputClass} value={form.altura_edificacao} onChange={(e) => update("altura_edificacao", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Responsável pelo Imóvel</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome</label>
          <input className={inputClass} value={form.responsavel_imovel_nome} onChange={(e) => update("responsavel_imovel_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>E-mail</label>
          <input className={inputClass} value={form.responsavel_imovel_email} onChange={(e) => update("responsavel_imovel_email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Fone</label>
          <input className={inputClass} value={form.responsavel_imovel_fone} onChange={(e) => update("responsavel_imovel_fone", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Responsável Técnico</h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome</label>
          <input className={inputClass} value={form.rt_nome} onChange={(e) => update("rt_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº de registro</label>
          <input className={inputClass} value={form.rt_registro} onChange={(e) => update("rt_registro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>E-mail</label>
          <input className={inputClass} value={form.rt_email} onChange={(e) => update("rt_email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Fone</label>
          <input className={inputClass} value={form.rt_fone} onChange={(e) => update("rt_fone", e.target.value)} />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button type="submit" className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}

function StepFinal({
  state,
  respostas,
  onChangeResposta,
  onBack,
  onNext,
}: {
  state: ComissionamentoElevadorState;
  respostas: Record<string, string>;
  onChangeResposta: (chave: string, resposta: string) => void;
  onBack: () => void;
  onNext: (partial: Partial<ComissionamentoElevadorState>) => void;
}) {
  const [elevadoresInfo, setElevadoresInfo] = useState(state.elevadores_info ?? "");
  const [justificativas, setJustificativas] = useState(state.justificativas ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ elevadores_info: elevadoresInfo, justificativas });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <ChecklistGenerico titulo={`${SECOES_ELEVADOR[4].numero}. ${SECOES_ELEVADOR[4].titulo}`} itens={SECOES_ELEVADOR[4].itens} respostas={respostas} onChange={onChangeResposta} comNa />

      <div className="space-y-1.5">
        <label className={labelClass}>Relação dos elevadores (tipo, fabricante, transporte de maca, lotação máxima, ano de fabricação)</label>
        <textarea rows={4} className={inputClass} value={elevadoresInfo} onChange={(e) => setElevadoresInfo(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Justificativas técnicas para não atendimento dos itens assinalados</label>
        <textarea rows={5} className={inputClass} value={justificativas} onChange={(e) => setJustificativas(e.target.value)} />
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button type="submit" className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
