"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, FileDown, Loader2, PartyPopper, Search } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { salvarRelatorioPrestacao } from "@/app/actions/in28";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import type { Cliente } from "@/lib/supabase/types";
import type { RelatorioPrestacaoState } from "@/lib/in28/types";

const DRAFT_KEY = "scfire_in28_prestacao_wizard_draft";
const STEPS = [{ label: "Empresa" }, { label: "Atividades" }, { label: "Revisão" }];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface PrestacaoWizardProps {
  clientes: Cliente[];
  clienteIdInicial?: string;
  initialState?: RelatorioPrestacaoState;
}

export function PrestacaoWizard({ clientes, clienteIdInicial, initialState }: PrestacaoWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<RelatorioPrestacaoState>(() => initialState ?? { step: clienteIdInicial ? 1 : 0 });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<RelatorioPrestacaoState | null>(null);
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
          cliente: { id: cliente.id, razao_social: cliente.razao_social ?? cliente.nome, cnpj: cliente.cnpj_cpf ?? undefined },
          razao_social: cliente.razao_social ?? cliente.nome,
          cnpj: cliente.cnpj_cpf ?? undefined,
          cidade: cliente.cidade ?? undefined,
          bairro: cliente.bairro ?? undefined,
          endereco: cliente.logradouro ?? undefined,
          numero: cliente.numero ?? undefined,
          complemento: cliente.complemento ?? undefined,
          cep: cliente.cep ?? undefined,
          telefones: cliente.telefone ?? undefined,
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

  function avancarPara(step: number, partial: Partial<RelatorioPrestacaoState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos serão perdidos.")) {
      clearDraft();
      router.push("/documentos/in28");
    }
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarRelatorioPrestacao(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o relatório.");
        return;
      }
      setSalvo(result.data.dados as RelatorioPrestacaoState);
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
      const { gerarPdfRelatorioPrestacao } = await import("@/lib/in28/pdf-generator");
      await gerarPdfRelatorioPrestacao(salvo);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixando(false);
    }
  }

  function handleConcluir() {
    clearDraft();
    router.push("/documentos/in28/prestacao");
    router.refresh();
  }

  const step = state.step ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Relatório — Empresa de Prestação de Serviço de Brigadistas</h1>
          <p className="text-sm text-gray-400 mt-1">IN 28/CBMSC — Anexo F — Relatório anual de atividades.</p>
        </div>
        <button onClick={handleCancelar} className="px-3 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
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
          redirectToNovoCliente="/documentos/in28/prestacao/novo"
          titulo="Selecione a Empresa de Prestação de Serviço"
          onNext={(clienteId, cliente) =>
            avancarPara(1, {
              cliente_id: clienteId,
              cliente,
              razao_social: cliente.razao_social,
              cnpj: cliente.cnpj,
              cidade: cliente.cidade,
              bairro: cliente.bairro,
              endereco: cliente.logradouro,
              numero: cliente.numero,
              complemento: cliente.complemento,
              cep: cliente.cep,
              telefones: cliente.telefone,
            })
          }
        />
      )}

      {step === 1 && <StepDados state={state} onBack={() => avancarPara(0)} onNext={(partial) => avancarPara(2, partial)} />}

      {step === 2 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">{salvo ? "Relatório Salvo!" : "Pronto para Salvar o Relatório!"}</h3>
            <p className="text-sm text-gray-400">{salvo ? "Baixe o PDF abaixo." : "Revise os dados abaixo antes de salvar."}</p>
          </div>

          {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

          <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Empresa:</strong> {state.razao_social || "-"}</p>
            <p><strong className="text-white">Ano de referência:</strong> {state.ano_referencia || "-"}</p>
          </div>

          {!salvo ? (
            <div className="flex justify-center gap-3 pt-2">
              <button type="button" onClick={() => avancarPara(1)} className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
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
                  Baixar Anexo F (PDF)
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

function StepDados({
  state,
  onBack,
  onNext,
}: {
  state: RelatorioPrestacaoState;
  onBack: () => void;
  onNext: (partial: Partial<RelatorioPrestacaoState>) => void;
}) {
  const [form, setForm] = useState({
    ano_referencia: state.ano_referencia ?? new Date().getFullYear().toString(),
    razao_social: state.razao_social ?? "",
    nome_fantasia: state.nome_fantasia ?? "",
    cnpj: state.cnpj ?? "",
    num_credenciamento: state.num_credenciamento ?? "",
    cidade: state.cidade ?? "",
    bairro: state.bairro ?? "",
    endereco: state.endereco ?? "",
    numero: state.numero ?? "",
    complemento: state.complemento ?? "",
    cep: state.cep ?? "",
    telefones: state.telefones ?? "",
    numero_eventos_concentracao: state.numero_eventos_concentracao ?? "",
    relacao_brigadistas: state.relacao_brigadistas ?? "",
    observacoes_sugestoes: state.observacoes_sugestoes ?? "",
    nome_responsavel_declaracao: state.nome_responsavel_declaracao ?? "",
    local_data: state.local_data ?? "",
  });
  const [terceirizado, setTerceirizado] = useState(state.possui_servico_terceirizado ?? false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepInfo, setCepInfo] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function buscarCep() {
    const cepLimpo = form.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setCepInfo("CEP incompleto — preenchendo o endereço manualmente é só continuar.");
      return;
    }
    setBuscandoCep(true);
    setCepInfo("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((f) => ({ ...f, endereco: data.logradouro, bairro: data.bairro, cidade: data.localidade }));
      } else {
        setCepInfo("CEP não encontrado — preencha o endereço manualmente.");
      }
    } catch {
      setCepInfo("Não consegui buscar o CEP agora — preencha o endereço manualmente.");
    } finally {
      setBuscandoCep(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ ...form, possui_servico_terceirizado: terceirizado });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="space-y-1.5 max-w-xs">
        <label className={labelClass}>Ano de referência</label>
        <input className={inputClass} value={form.ano_referencia} onChange={(e) => update("ano_referencia", e.target.value)} />
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">1. Dados da Empresa</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Razão social</label>
          <input className={inputClass} value={form.razao_social} onChange={(e) => update("razao_social", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nome fantasia</label>
          <input className={inputClass} value={form.nome_fantasia} onChange={(e) => update("nome_fantasia", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CNPJ</label>
          <input className={inputClass} value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº Credenciamento CBMSC</label>
          <input className={inputClass} value={form.num_credenciamento} onChange={(e) => update("num_credenciamento", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>Endereço</label>
          <input className={inputClass} value={form.endereco} onChange={(e) => update("endereco", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº</label>
          <input className={inputClass} value={form.numero} onChange={(e) => update("numero", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Complemento</label>
          <input className={inputClass} value={form.complemento} onChange={(e) => update("complemento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input className={inputClass} value={form.bairro} onChange={(e) => update("bairro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} value={form.cidade} onChange={(e) => update("cidade", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CEP</label>
          <div className="flex gap-2">
            <input className={inputClass} value={form.cep} onChange={(e) => update("cep", e.target.value)} />
            <button
              type="button"
              onClick={buscarCep}
              disabled={buscandoCep}
              className="px-3 rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              {buscandoCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Buscar
            </button>
          </div>
          {cepInfo && <span className="text-xs text-gray-400">{cepInfo}</span>}
        </div>
      </div>
      <div className="space-y-1.5 max-w-xs">
        <label className={labelClass}>Telefones de contato</label>
        <input className={inputClass} value={form.telefones} onChange={(e) => update("telefones", e.target.value)} />
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">2. Atividades Desenvolvidas</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nº de eventos com concentração de público</label>
          <input className={inputClass} value={form.numero_eventos_concentracao} onChange={(e) => update("numero_eventos_concentracao", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Possui serviço de brigadista terceirizado?</label>
          <div className="flex rounded-lg border border-white/[0.08] overflow-hidden w-fit">
            <button type="button" onClick={() => setTerceirizado(true)} className={`px-4 py-1.5 text-xs font-semibold transition-all ${terceirizado ? "bg-red-500 text-white" : "text-gray-400 hover:bg-white/[0.04]"}`}>
              Sim
            </button>
            <button type="button" onClick={() => setTerceirizado(false)} className={`px-4 py-1.5 text-xs font-semibold transition-all border-l border-white/[0.08] ${!terceirizado ? "bg-red-500 text-white" : "text-gray-400 hover:bg-white/[0.04]"}`}>
              Não
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Relação dos brigadistas (nome e CPF)</label>
        <textarea rows={4} className={inputClass} value={form.relacao_brigadistas} onChange={(e) => update("relacao_brigadistas", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Observações e Sugestões</label>
        <textarea rows={2} className={inputClass} value={form.observacoes_sugestoes} onChange={(e) => update("observacoes_sugestoes", e.target.value)} />
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">3. Declaração</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome do Proprietário/Diretor/Presidente</label>
          <input className={inputClass} value={form.nome_responsavel_declaracao} onChange={(e) => update("nome_responsavel_declaracao", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Local (cidade)</label>
          <input className={inputClass} value={form.local_data} onChange={(e) => update("local_data", e.target.value)} />
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
