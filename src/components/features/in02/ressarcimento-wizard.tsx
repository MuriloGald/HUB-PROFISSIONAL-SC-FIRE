"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, FileDown, Loader2, PartyPopper } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { ListaEditavel } from "@/components/features/plano-ensino/wizard/lista-editavel";
import { salvarRessarcimento } from "@/app/actions/in02";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import type { Cliente } from "@/lib/supabase/types";
import type { RessarcimentoWizardState } from "@/lib/in02/types";

const DRAFT_KEY = "scfire_in02_ressarcimento_wizard_draft";
const STEPS = [{ label: "Requerente" }, { label: "Multa e Motivos" }, { label: "Revisão" }];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface RessarcimentoWizardProps {
  clientes: Cliente[];
  clienteIdInicial?: string;
  initialState?: RessarcimentoWizardState;
}

export function RessarcimentoWizard({ clientes, clienteIdInicial, initialState }: RessarcimentoWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<RessarcimentoWizardState>(() => initialState ?? { tipo: "pf", step: clienteIdInicial ? 1 : 0 });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<RessarcimentoWizardState | null>(null);
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
          tipo: cliente.cnpj_cpf && cliente.cnpj_cpf.replace(/\D/g, "").length === 14 ? "pj" : "pf",
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
          requerente_nome: cliente.responsavel_nome ?? cliente.razao_social ?? cliente.nome,
          requerente_cpf: cliente.cnpj_cpf && cliente.cnpj_cpf.replace(/\D/g, "").length === 11 ? cliente.cnpj_cpf : undefined,
          empresa_razao_social: cliente.cnpj_cpf && cliente.cnpj_cpf.replace(/\D/g, "").length === 14 ? cliente.razao_social ?? undefined : undefined,
          empresa_cnpj: cliente.cnpj_cpf && cliente.cnpj_cpf.replace(/\D/g, "").length === 14 ? cliente.cnpj_cpf : undefined,
          imovel_logradouro: cliente.logradouro ?? undefined,
          imovel_numero: cliente.numero ?? undefined,
          imovel_bairro: cliente.bairro ?? undefined,
          imovel_municipio: cliente.cidade ?? undefined,
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

  function avancarPara(step: number, partial: Partial<RessarcimentoWizardState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste requerimento serão perdidos.")) {
      clearDraft();
      router.push("/documentos/in02");
    }
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarRessarcimento(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o requerimento.");
        return;
      }
      setSalvo(result.data.dados as RessarcimentoWizardState);
    } catch (err) {
      console.error("Erro ao salvar o requerimento:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao salvar o requerimento. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  async function handleBaixar() {
    if (!salvo) return;
    setBaixando(true);
    setErro(null);
    try {
      const { gerarPdfRessarcimento } = await import("@/lib/in02/pdf-generator");
      await gerarPdfRessarcimento(salvo);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixando(false);
    }
  }

  function handleConcluir() {
    clearDraft();
    router.push("/documentos/in02/ressarcimento");
    router.refresh();
  }

  const step = state.step ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Requerimento de Ressarcimento de Multa</h1>
          <p className="text-sm text-gray-400 mt-1">IN 02/CBMSC — Anexo K (pessoa física) / Anexo L (pessoa jurídica).</p>
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
          redirectToNovoCliente="/documentos/in02/ressarcimento/novo"
          titulo="Selecione o Requerente (Cliente)"
          onNext={(clienteId, cliente) =>
            avancarPara(1, {
              cliente_id: clienteId,
              cliente,
              tipo: cliente.cnpj ? "pj" : "pf",
              requerente_nome: cliente.nome_responsavel || cliente.razao_social,
              requerente_cpf: cliente.cpf,
              empresa_razao_social: cliente.cnpj ? cliente.razao_social : undefined,
              empresa_cnpj: cliente.cnpj,
              imovel_logradouro: cliente.logradouro,
              imovel_numero: cliente.numero,
              imovel_bairro: cliente.bairro,
              imovel_municipio: cliente.cidade,
              imovel_re: cliente.re,
            })
          }
        />
      )}

      {step === 1 && <StepDados state={state} onBack={() => avancarPara(0)} onNext={(partial) => avancarPara(2, partial)} />}

      {step === 2 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">{salvo ? "Requerimento Salvo!" : "Pronto para Salvar o Requerimento!"}</h3>
            <p className="text-sm text-gray-400">{salvo ? "Baixe o PDF abaixo." : "Revise os dados abaixo antes de salvar."}</p>
          </div>

          {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

          <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Tipo:</strong> {state.tipo === "pj" ? "Pessoa Jurídica" : "Pessoa Física"}</p>
            <p><strong className="text-white">Requerente:</strong> {state.requerente_nome || "-"}</p>
            {state.tipo === "pj" && <p><strong className="text-white">Empresa:</strong> {state.empresa_razao_social || "-"} ({state.empresa_cnpj || "-"})</p>}
            <p><strong className="text-white">Multa:</strong> {state.multa_numero || "-"} — R$ {state.multa_valor || "-"}</p>
            <p><strong className="text-white">Motivos:</strong> {(state.motivos || []).length}</p>
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
                Salvar Requerimento
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
                  Baixar Requerimento (PDF)
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleConcluir}
                  className="px-4 py-2 border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-white hover:text-emerald-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <PartyPopper className="w-3.5 h-3.5" /> Concluir e Voltar para Consultar Requerimentos
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
  state: RessarcimentoWizardState;
  onBack: () => void;
  onNext: (partial: Partial<RessarcimentoWizardState>) => void;
}) {
  const [form, setForm] = useState({
    tipo: state.tipo ?? "pf",
    ssci_municipio: state.ssci_municipio ?? "",
    requerente_nome: state.requerente_nome ?? "",
    requerente_cpf: state.requerente_cpf ?? "",
    empresa_razao_social: state.empresa_razao_social ?? "",
    empresa_cnpj: state.empresa_cnpj ?? "",
    multa_numero: state.multa_numero ?? "",
    multa_valor: state.multa_valor ?? "",
    multa_valor_extenso: state.multa_valor_extenso ?? "",
    imovel_logradouro: state.imovel_logradouro ?? "",
    imovel_numero: state.imovel_numero ?? "",
    imovel_bairro: state.imovel_bairro ?? "",
    imovel_municipio: state.imovel_municipio ?? "",
    imovel_re: state.imovel_re ?? "",
    local_data_municipio: state.local_data_municipio ?? state.imovel_municipio ?? "",
  });
  const [motivos, setMotivos] = useState<string[]>(state.motivos ?? []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ ...form, motivos });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="flex items-center gap-3">
        <span className={labelClass}>Tipo de Requerente</span>
        <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
          <button
            type="button"
            onClick={() => update("tipo", "pf")}
            className={`px-4 py-1.5 text-xs font-semibold transition-all ${form.tipo === "pf" ? "bg-red-500 text-white" : "text-gray-400 hover:bg-white/[0.04]"}`}
          >
            Pessoa Física (Anexo K)
          </button>
          <button
            type="button"
            onClick={() => update("tipo", "pj")}
            className={`px-4 py-1.5 text-xs font-semibold transition-all ${form.tipo === "pj" ? "bg-red-500 text-white" : "text-gray-400 hover:bg-white/[0.04]"}`}
          >
            Pessoa Jurídica (Anexo L)
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Ao Serviço de Segurança Contra Incêndio de (município)</label>
        <input className={inputClass} value={form.ssci_municipio} onChange={(e) => update("ssci_municipio", e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome do requerente</label>
          <input className={inputClass} value={form.requerente_nome} onChange={(e) => update("requerente_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CPF</label>
          <input className={inputClass} value={form.requerente_cpf} onChange={(e) => update("requerente_cpf", e.target.value)} />
        </div>
      </div>

      {form.tipo === "pj" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Razão Social da empresa</label>
            <input className={inputClass} value={form.empresa_razao_social} onChange={(e) => update("empresa_razao_social", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>CNPJ</label>
            <input className={inputClass} value={form.empresa_cnpj} onChange={(e) => update("empresa_cnpj", e.target.value)} />
          </div>
        </div>
      )}

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Multa</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nº da multa (MULXXXXXXXXX/XX)</label>
          <input className={inputClass} value={form.multa_numero} onChange={(e) => update("multa_numero", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Valor (R$)</label>
          <input className={inputClass} value={form.multa_valor} onChange={(e) => update("multa_valor", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Valor por extenso</label>
          <input className={inputClass} value={form.multa_valor_extenso} onChange={(e) => update("multa_valor_extenso", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Edificação</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Endereço</label>
          <input className={inputClass} value={form.imovel_logradouro} onChange={(e) => update("imovel_logradouro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº</label>
          <input className={inputClass} value={form.imovel_numero} onChange={(e) => update("imovel_numero", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input className={inputClass} value={form.imovel_bairro} onChange={(e) => update("imovel_bairro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Município</label>
          <input className={inputClass} value={form.imovel_municipio} onChange={(e) => update("imovel_municipio", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>RE</label>
          <input className={inputClass} value={form.imovel_re} onChange={(e) => update("imovel_re", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Motivo do Requerimento</h4>
      <ListaEditavel itens={motivos} onChange={setMotivos} placeholder="Descreva um motivo e tecle Enter" />

      <div className="space-y-1.5">
        <label className={labelClass}>Município para a data de assinatura</label>
        <input className={inputClass} value={form.local_data_municipio} onChange={(e) => update("local_data_municipio", e.target.value)} />
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
