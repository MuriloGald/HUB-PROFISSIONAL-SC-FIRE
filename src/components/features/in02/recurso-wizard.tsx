"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, FileDown, Loader2, PartyPopper } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { salvarRecurso } from "@/app/actions/in02";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import type { Cliente } from "@/lib/supabase/types";
import type { RecursoWizardState } from "@/lib/in02/types";

const DRAFT_KEY = "scfire_in02_recurso_wizard_draft";
const STEPS = [{ label: "Autuado" }, { label: "Imóvel e Argumentação" }, { label: "Revisão" }];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface RecursoWizardProps {
  clientes: Cliente[];
  clienteIdInicial?: string;
  initialState?: RecursoWizardState;
}

export function RecursoWizard({ clientes, clienteIdInicial, initialState }: RecursoWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<RecursoWizardState>(() => initialState ?? { step: clienteIdInicial ? 1 : 0 });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<RecursoWizardState | null>(null);
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
          autuado_nome: cliente.razao_social ?? cliente.nome,
          autuado_cpf_cnpj: cliente.cnpj_cpf ?? undefined,
          autuado_email: cliente.email ?? undefined,
          autuado_telefone: cliente.telefone ?? undefined,
          autuado_logradouro: cliente.logradouro ?? undefined,
          autuado_numero: cliente.numero ?? undefined,
          autuado_complemento: cliente.complemento ?? undefined,
          autuado_bairro: cliente.bairro ?? undefined,
          autuado_cidade: cliente.cidade ?? undefined,
          imovel_re: cliente.re ?? undefined,
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

  function avancarPara(step: number, partial: Partial<RecursoWizardState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste recurso serão perdidos.")) {
      clearDraft();
      router.push("/documentos/in02");
    }
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarRecurso(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o recurso.");
        return;
      }
      setSalvo(result.data.dados as RecursoWizardState);
    } catch (err) {
      console.error("Erro ao salvar o recurso:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao salvar o recurso. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  async function handleBaixar() {
    if (!salvo) return;
    setBaixando(true);
    setErro(null);
    try {
      const { gerarPdfRecurso } = await import("@/lib/in02/pdf-generator");
      await gerarPdfRecurso(salvo);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixando(false);
    }
  }

  function handleConcluir() {
    clearDraft();
    router.push("/documentos/in02/recurso");
    router.refresh();
  }

  const step = state.step ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Formulário de Recurso</h1>
          <p className="text-sm text-gray-400 mt-1">IN 02/CBMSC — Anexo J — recurso contra Auto de Infração.</p>
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
          redirectToNovoCliente="/documentos/in02/recurso/novo"
          titulo="Selecione o Autuado (Cliente)"
          onNext={(clienteId, cliente) =>
            avancarPara(1, {
              cliente_id: clienteId,
              cliente,
              autuado_nome: cliente.razao_social,
              autuado_cpf_cnpj: cliente.cnpj || cliente.cpf,
              autuado_email: cliente.email,
              autuado_telefone: cliente.telefone,
              autuado_logradouro: cliente.logradouro,
              autuado_numero: cliente.numero,
              autuado_complemento: cliente.complemento,
              autuado_bairro: cliente.bairro,
              autuado_cidade: cliente.cidade,
              imovel_re: cliente.re,
            })
          }
        />
      )}

      {step === 1 && (
        <StepDados state={state} onBack={() => avancarPara(0)} onNext={(partial) => avancarPara(2, partial)} />
      )}

      {step === 2 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">{salvo ? "Recurso Salvo!" : "Pronto para Salvar o Recurso!"}</h3>
            <p className="text-sm text-gray-400">{salvo ? "Baixe o PDF do formulário abaixo." : "Revise os dados abaixo antes de salvar."}</p>
          </div>

          {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

          <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Autuado:</strong> {state.autuado_nome || "-"}</p>
            <p><strong className="text-white">CPF/CNPJ:</strong> {state.autuado_cpf_cnpj || "-"}</p>
            <p><strong className="text-white">Auto de Infração Nº:</strong> {state.auto_infracao_numero || "-"}</p>
            <p><strong className="text-white">RE do Imóvel:</strong> {state.imovel_re || "-"}</p>
            <p><strong className="text-white">Argumentação:</strong> {state.argumentacao ? `${state.argumentacao.slice(0, 120)}...` : "-"}</p>
          </div>

          {!salvo ? (
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => avancarPara(1)}
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
                Salvar Recurso
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
                  Baixar Formulário de Recurso (PDF)
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleConcluir}
                  className="px-4 py-2 border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-white hover:text-emerald-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <PartyPopper className="w-3.5 h-3.5" /> Concluir e Voltar para Consultar Recursos
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepDados({
  state,
  onBack,
  onNext,
}: {
  state: RecursoWizardState;
  onBack: () => void;
  onNext: (partial: Partial<RecursoWizardState>) => void;
}) {
  const [form, setForm] = useState({
    auto_infracao_numero: state.auto_infracao_numero ?? "",
    auto_infracao_recebido_em: state.auto_infracao_recebido_em ?? "",
    autuado_nome: state.autuado_nome ?? "",
    autuado_cpf_cnpj: state.autuado_cpf_cnpj ?? "",
    autuado_email: state.autuado_email ?? "",
    autuado_telefone: state.autuado_telefone ?? "",
    autuado_logradouro: state.autuado_logradouro ?? "",
    autuado_numero: state.autuado_numero ?? "",
    autuado_complemento: state.autuado_complemento ?? "",
    autuado_bairro: state.autuado_bairro ?? "",
    autuado_cidade: state.autuado_cidade ?? "",
    autuado_cep: state.autuado_cep ?? "",
    imovel_re: state.imovel_re ?? "",
    imovel_cnpj: state.imovel_cnpj ?? "",
    imovel_logradouro: state.imovel_logradouro ?? "",
    imovel_numero: state.imovel_numero ?? "",
    imovel_complemento: state.imovel_complemento ?? "",
    imovel_bairro: state.imovel_bairro ?? "",
    imovel_cidade: state.imovel_cidade ?? "",
    imovel_cep: state.imovel_cep ?? "",
    imovel_detalhes: state.imovel_detalhes ?? "",
    argumentacao: state.argumentacao ?? "",
    responsavel_nome: state.responsavel_nome ?? state.autuado_nome ?? "",
    responsavel_cpf: state.responsavel_cpf ?? "",
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
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Auto de Infração</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nº do Auto de Infração</label>
          <input className={inputClass} value={form.auto_infracao_numero} onChange={(e) => update("auto_infracao_numero", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Recebido em</label>
          <input type="date" className={inputClass} value={form.auto_infracao_recebido_em} onChange={(e) => update("auto_infracao_recebido_em", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">1. Autuado</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome</label>
          <input className={inputClass} value={form.autuado_nome} onChange={(e) => update("autuado_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CPF/CNPJ</label>
          <input className={inputClass} value={form.autuado_cpf_cnpj} onChange={(e) => update("autuado_cpf_cnpj", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>E-mail</label>
          <input className={inputClass} value={form.autuado_email} onChange={(e) => update("autuado_email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Telefone(s)</label>
          <input className={inputClass} value={form.autuado_telefone} onChange={(e) => update("autuado_telefone", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>Logradouro</label>
          <input className={inputClass} value={form.autuado_logradouro} onChange={(e) => update("autuado_logradouro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Número</label>
          <input className={inputClass} value={form.autuado_numero} onChange={(e) => update("autuado_numero", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Complemento</label>
          <input className={inputClass} value={form.autuado_complemento} onChange={(e) => update("autuado_complemento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input className={inputClass} value={form.autuado_bairro} onChange={(e) => update("autuado_bairro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} value={form.autuado_cidade} onChange={(e) => update("autuado_cidade", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5 max-w-xs">
        <label className={labelClass}>CEP</label>
        <input className={inputClass} value={form.autuado_cep} onChange={(e) => update("autuado_cep", e.target.value)} />
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">2. Descrição do Imóvel</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>RE</label>
          <input className={inputClass} value={form.imovel_re} onChange={(e) => update("imovel_re", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CNPJ</label>
          <input className={inputClass} value={form.imovel_cnpj} onChange={(e) => update("imovel_cnpj", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>Logradouro</label>
          <input className={inputClass} value={form.imovel_logradouro} onChange={(e) => update("imovel_logradouro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Número</label>
          <input className={inputClass} value={form.imovel_numero} onChange={(e) => update("imovel_numero", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Complemento</label>
          <input className={inputClass} value={form.imovel_complemento} onChange={(e) => update("imovel_complemento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input className={inputClass} value={form.imovel_bairro} onChange={(e) => update("imovel_bairro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} value={form.imovel_cidade} onChange={(e) => update("imovel_cidade", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5 max-w-xs">
        <label className={labelClass}>CEP</label>
        <input className={inputClass} value={form.imovel_cep} onChange={(e) => update("imovel_cep", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Detalhes (se houver)</label>
        <input className={inputClass} value={form.imovel_detalhes} onChange={(e) => update("imovel_detalhes", e.target.value)} />
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">3. Argumentação</h4>
      <textarea rows={8} className={inputClass} value={form.argumentacao} onChange={(e) => update("argumentacao", e.target.value)} />

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">4. Responsável por este Recurso</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome</label>
          <input className={inputClass} value={form.responsavel_nome} onChange={(e) => update("responsavel_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CPF</label>
          <input className={inputClass} value={form.responsavel_cpf} onChange={(e) => update("responsavel_cpf", e.target.value)} />
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
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
