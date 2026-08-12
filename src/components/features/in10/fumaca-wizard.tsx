"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, FileDown, Loader2, PartyPopper } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { ProfissionalCampoSelect } from "@/components/features/profissionais/profissional-campo-select";
import { ChecklistGenerico, RespostaToggle } from "@/components/features/shared/resposta-toggle";
import { salvarControleFumaca } from "@/app/actions/in10";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import { DOCS_DEIXADOS, INTEGRIDADE_COMPONENTES, ENSAIOS_FUMACA } from "@/lib/in10/constants";
import type { Cliente, Profissional } from "@/lib/supabase/types";
import type { ControleFumacaState, RespostaSN } from "@/lib/in10/types";

const DRAFT_KEY = "scfire_in10_fumaca_wizard_draft";
const STEPS = [{ label: "Identificação" }, { label: "Documentação/Instruções" }, { label: "Ensaios" }, { label: "Conclusão" }, { label: "Revisão" }];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface FumacaWizardProps {
  clientes: Cliente[];
  profissionais: Profissional[];
  clienteIdInicial?: string;
  initialState?: ControleFumacaState;
}

export function FumacaWizard({ clientes, profissionais, clienteIdInicial, initialState }: FumacaWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<ControleFumacaState>(() => initialState ?? { step: clienteIdInicial ? 1 : 0, fluxo: "comissionamento" });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<ControleFumacaState | null>(null);
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
          fluxo: "comissionamento",
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
          endereco: cliente.logradouro ?? undefined,
          numero: cliente.numero ?? undefined,
          complemento: cliente.complemento ?? undefined,
          bairro: cliente.bairro ?? undefined,
          municipio_uf: cliente.cidade ? `${cliente.cidade} - ${cliente.estado || "SC"}` : undefined,
          re: cliente.re ?? undefined,
          proprietario_nome: cliente.razao_social ?? cliente.nome,
          proprietario_email: cliente.email ?? undefined,
          proprietario_fone: cliente.telefone ?? undefined,
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

  function avancarPara(step: number, partial: Partial<ControleFumacaState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste relatório serão perdidos.")) {
      clearDraft();
      router.push("/documentos/in10");
    }
  }

  function setEnsaio(chave: string, resposta: string) {
    setState((s) => ({ ...s, ensaios: { ...s.ensaios, [chave]: resposta as RespostaSN } }));
  }

  function setDoc(chave: string, resposta: string) {
    setState((s) => ({ ...s, docs_deixados: { ...s.docs_deixados, [chave]: resposta as RespostaSN } }));
  }

  function setIntegridade(chave: string, resposta: string) {
    setState((s) => ({ ...s, integridade: { ...s.integridade, [chave]: resposta as RespostaSN } }));
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarControleFumaca(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o relatório.");
        return;
      }
      setSalvo(result.data.dados as ControleFumacaState);
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
      const { gerarPdfComissionamentoFumaca, gerarPdfInspecaoFumaca } = await import("@/lib/in10/pdf-generator");
      if (salvo.fluxo === "inspecao") {
        await gerarPdfInspecaoFumaca(salvo);
      } else {
        await gerarPdfComissionamentoFumaca(salvo);
      }
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixando(false);
    }
  }

  function handleConcluir() {
    clearDraft();
    router.push("/documentos/in10/lista");
    router.refresh();
  }

  const step = state.step ?? 0;
  const isComissionamento = (state.fluxo ?? "comissionamento") === "comissionamento";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Relatório do Sistema de Controle de Fumaça</h1>
          <p className="text-sm text-gray-400 mt-1">IN 10/CBMSC — Anexo B (Comissionamento) ou Anexo C (Inspeção).</p>
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
          redirectToNovoCliente="/documentos/in10/novo"
          titulo="Selecione o Proprietário/Imóvel"
          onNext={(clienteId, cliente) =>
            avancarPara(1, {
              cliente_id: clienteId,
              cliente,
              endereco: cliente.logradouro,
              numero: cliente.numero,
              complemento: cliente.complemento,
              bairro: cliente.bairro,
              municipio_uf: cliente.cidade ? `${cliente.cidade} - ${cliente.estado || "SC"}` : undefined,
              re: cliente.re,
              proprietario_nome: cliente.razao_social,
              proprietario_email: cliente.email,
              proprietario_fone: cliente.telefone,
            })
          }
        />
      )}

      {step === 1 && (
        <StepIdentificacao state={state} profissionais={profissionais} onBack={() => avancarPara(0)} onNext={(partial) => avancarPara(2, partial)} />
      )}

      {step === 2 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          {isComissionamento ? (
            <StepComissionamentoEspecifico state={state} onChange={(partial) => setState((s) => ({ ...s, ...partial }))} onChangeDoc={setDoc} />
          ) : (
            <StepInspecaoEspecifico state={state} onChange={(partial) => setState((s) => ({ ...s, ...partial }))} onChangeIntegridade={setIntegridade} />
          )}
          <StepClima state={state} onChange={(partial) => setState((s) => ({ ...s, ...partial }))} />
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
          <ChecklistGenerico titulo="Ensaios" itens={ENSAIOS_FUMACA} respostas={state.ensaios || {}} onChange={setEnsaio} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Tempo para ativação (segundos)</label>
              <input className={inputClass} value={state.tempo_ativacao_segundos ?? ""} onChange={(e) => setState((s) => ({ ...s, tempo_ativacao_segundos: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Observações dos ensaios (se algum item for &quot;Não&quot;, explicar)</label>
            <textarea rows={3} className={inputClass} value={state.ensaios_explicacao ?? ""} onChange={(e) => setState((s) => ({ ...s, ensaios_explicacao: e.target.value }))} />
          </div>
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

      {step === 4 && <StepConclusao state={state} onBack={() => avancarPara(3)} onNext={(partial) => avancarPara(5, partial)} />}

      {step === 5 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">{salvo ? "Relatório Salvo!" : "Pronto para Salvar o Relatório!"}</h3>
            <p className="text-sm text-gray-400">{salvo ? "Baixe o PDF abaixo." : "Revise os dados abaixo antes de salvar."}</p>
          </div>

          {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

          <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Tipo:</strong> {isComissionamento ? "Comissionamento (Anexo B)" : "Inspeção (Anexo C)"}</p>
            <p><strong className="text-white">Proprietário:</strong> {state.proprietario_nome || "-"}</p>
            <p><strong className="text-white">RE:</strong> {state.re || "-"}</p>
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
                  Baixar {isComissionamento ? "Anexo B" : "Anexo C"} (PDF)
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
  profissionais,
  onBack,
  onNext,
}: {
  state: ControleFumacaState;
  profissionais: Profissional[];
  onBack: () => void;
  onNext: (partial: Partial<ControleFumacaState>) => void;
}) {
  const [fluxo, setFluxo] = useState(state.fluxo ?? "comissionamento");
  const [form, setForm] = useState({
    endereco: state.endereco ?? "",
    numero: state.numero ?? "",
    complemento: state.complemento ?? "",
    bairro: state.bairro ?? "",
    municipio_uf: state.municipio_uf ?? "",
    re: state.re ?? "",
    ocupacao_tipo: state.ocupacao_tipo ?? "",
    proprietario_nome: state.proprietario_nome ?? "",
    proprietario_email: state.proprietario_email ?? "",
    proprietario_fone: state.proprietario_fone ?? "",
    responsavel_uso_nome: state.responsavel_uso_nome ?? "",
    responsavel_uso_email: state.responsavel_uso_email ?? "",
    rt_id: state.rt_id ?? "",
    rt: state.rt,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ ...form, fluxo });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="flex items-center gap-3">
        <span className={labelClass}>Tipo de Relatório</span>
        <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
          <button type="button" onClick={() => setFluxo("comissionamento")} className={`px-4 py-1.5 text-xs font-semibold transition-all ${fluxo === "comissionamento" ? "bg-red-500 text-white" : "text-gray-400 hover:bg-white/[0.04]"}`}>
            Comissionamento (Anexo B)
          </button>
          <button type="button" onClick={() => setFluxo("inspecao")} className={`px-4 py-1.5 text-xs font-semibold transition-all ${fluxo === "inspecao" ? "bg-red-500 text-white" : "text-gray-400 hover:bg-white/[0.04]"}`}>
            Inspeção Periódica (Anexo C)
          </button>
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Endereço</h4>
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
          <input className={inputClass} value={form.municipio_uf} onChange={(e) => update("municipio_uf", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>RE</label>
          <input className={inputClass} value={form.re} onChange={(e) => update("re", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Ocupação e tipo</label>
          <input className={inputClass} value={form.ocupacao_tipo} onChange={(e) => update("ocupacao_tipo", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Proprietário</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome</label>
          <input className={inputClass} value={form.proprietario_nome} onChange={(e) => update("proprietario_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>E-mail</label>
          <input className={inputClass} value={form.proprietario_email} onChange={(e) => update("proprietario_email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Fone</label>
          <input className={inputClass} value={form.proprietario_fone} onChange={(e) => update("proprietario_fone", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Responsável Uso/Brigadista</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome</label>
          <input className={inputClass} value={form.responsavel_uso_nome} onChange={(e) => update("responsavel_uso_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>E-mail</label>
          <input className={inputClass} value={form.responsavel_uso_email} onChange={(e) => update("responsavel_uso_email", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Responsável Técnico pelo Comissionamento/Inspeção</h4>
      <ProfissionalCampoSelect
        profissionais={profissionais}
        value={form.rt_id}
        redirectToNovoProfissional="/documentos/in10/novo"
        onChange={(id, p) => setForm((f) => ({ ...f, rt_id: id, rt: p }))}
      />

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

function StepComissionamentoEspecifico({
  state,
  onChange,
  onChangeDoc,
}: {
  state: ControleFumacaState;
  onChange: (partial: Partial<ControleFumacaState>) => void;
  onChangeDoc: (chave: string, resposta: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Projeto</h4>
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02] rounded-lg border border-white/[0.08]">
        <span className="text-xs text-gray-300 flex-1">Instalação em conformidade com o projeto?</span>
        <RespostaToggle value={state.projeto_conformidade ?? ""} onChange={(v) => onChange({ projeto_conformidade: v as RespostaSN })} />
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02] rounded-lg border border-white/[0.08]">
        <span className="text-xs text-gray-300 flex-1">Equipamentos usados correspondem aos especificados no projeto?</span>
        <RespostaToggle value={state.projeto_equipamentos ?? ""} onChange={(v) => onChange({ projeto_equipamentos: v as RespostaSN })} />
      </div>
      <textarea
        rows={2}
        placeholder="Se não, explicar divergências"
        className={inputClass}
        value={state.projeto_divergencias ?? ""}
        onChange={(e) => onChange({ projeto_divergencias: e.target.value })}
      />

      <ChecklistGenerico titulo="Documentação deixada no local" itens={DOCS_DEIXADOS} respostas={state.docs_deixados || {}} onChange={onChangeDoc} />
      <textarea
        rows={2}
        placeholder="Se não, explicar"
        className={inputClass}
        value={state.docs_explicacao ?? ""}
        onChange={(e) => onChange({ docs_explicacao: e.target.value })}
      />
    </div>
  );
}

function StepInspecaoEspecifico({
  state,
  onChange,
  onChangeIntegridade,
}: {
  state: ControleFumacaState;
  onChange: (partial: Partial<ControleFumacaState>) => void;
  onChangeIntegridade: (chave: string, resposta: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Instruções</h4>
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02] rounded-lg border border-white/[0.08]">
        <span className="text-xs text-gray-300 flex-1">O responsável pelo uso do sistema foi instruído quanto à localização e cuidados dos componentes?</span>
        <RespostaToggle value={state.instrucao_realizada ?? ""} onChange={(v) => onChange({ instrucao_realizada: v as RespostaSN })} />
      </div>
      <input
        placeholder="Nome do responsável instruído"
        className={inputClass}
        value={state.instrucao_nome_responsavel ?? ""}
        onChange={(e) => onChange({ instrucao_nome_responsavel: e.target.value })}
      />
      <textarea
        rows={2}
        placeholder="Se não, explicar"
        className={inputClass}
        value={state.instrucao_explicacao ?? ""}
        onChange={(e) => onChange({ instrucao_explicacao: e.target.value })}
      />

      <ChecklistGenerico titulo="Integridade dos componentes do sistema" itens={INTEGRIDADE_COMPONENTES} respostas={state.integridade || {}} onChange={onChangeIntegridade} />
      <textarea
        rows={2}
        placeholder="Se não, explicar"
        className={inputClass}
        value={state.integridade_explicacao ?? ""}
        onChange={(e) => onChange({ integridade_explicacao: e.target.value })}
      />
    </div>
  );
}

function StepClima({ state, onChange }: { state: ControleFumacaState; onChange: (partial: Partial<ControleFumacaState>) => void }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Informações Climáticas do Dia</h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Velocidade do vento</label>
          <input className={inputClass} value={state.vento_velocidade ?? ""} onChange={(e) => onChange({ vento_velocidade: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Direção do vento</label>
          <input className={inputClass} value={state.vento_direcao ?? ""} onChange={(e) => onChange({ vento_direcao: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Temperatura externa</label>
          <input className={inputClass} value={state.temp_externa ?? ""} onChange={(e) => onChange({ temp_externa: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Pressão atmosférica</label>
          <input className={inputClass} value={state.pressao_atm ?? ""} onChange={(e) => onChange({ pressao_atm: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function StepConclusao({
  state,
  onBack,
  onNext,
}: {
  state: ControleFumacaState;
  onBack: () => void;
  onNext: (partial: Partial<ControleFumacaState>) => void;
}) {
  const [conclusao, setConclusao] = useState<RespostaSN>(state.conclusao ?? "");
  const [dataEntrega, setDataEntrega] = useState(state.data_entrega_funcionamento ?? "");
  const [nomeInstalador, setNomeInstalador] = useState(state.nome_instalador ?? "");
  const [infoAdicionais, setInfoAdicionais] = useState(state.informacoes_adicionais ?? "");
  const [testProprietarioNome, setTestProprietarioNome] = useState(state.testemunha_proprietario_nome ?? "");
  const [testProprietarioCargo, setTestProprietarioCargo] = useState(state.testemunha_proprietario_cargo ?? "");
  const [testProprietarioData, setTestProprietarioData] = useState(state.testemunha_proprietario_data ?? "");
  const [testInstaladorNome, setTestInstaladorNome] = useState(state.testemunha_instalador_nome ?? "");
  const [testInstaladorCargo, setTestInstaladorCargo] = useState(state.testemunha_instalador_cargo ?? "");
  const [testInstaladorData, setTestInstaladorData] = useState(state.testemunha_instalador_data ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({
      conclusao,
      data_entrega_funcionamento: dataEntrega,
      nome_instalador: nomeInstalador,
      informacoes_adicionais: infoAdicionais,
      testemunha_proprietario_nome: testProprietarioNome,
      testemunha_proprietario_cargo: testProprietarioCargo,
      testemunha_proprietario_data: testProprietarioData,
      testemunha_instalador_nome: testInstaladorNome,
      testemunha_instalador_cargo: testInstaladorCargo,
      testemunha_instalador_data: testInstaladorData,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02] rounded-lg border border-white/[0.08]">
        <span className="text-xs text-gray-300 flex-1">Após a realização e verificação dos ensaios, o sistema se encontra em condição de operação?</span>
        <RespostaToggle value={conclusao} onChange={(v) => setConclusao(v as RespostaSN)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Data em que a instalação foi entregue em funcionamento</label>
          <input type="date" className={inputClass} value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nome do instalador</label>
          <input className={inputClass} value={nomeInstalador} onChange={(e) => setNomeInstalador(e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Testemunhas</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Representante do proprietário</label>
          <input className={inputClass} value={testProprietarioNome} onChange={(e) => setTestProprietarioNome(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cargo</label>
          <input className={inputClass} value={testProprietarioCargo} onChange={(e) => setTestProprietarioCargo(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Data</label>
          <input type="date" className={inputClass} value={testProprietarioData} onChange={(e) => setTestProprietarioData(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Representante do instalador</label>
          <input className={inputClass} value={testInstaladorNome} onChange={(e) => setTestInstaladorNome(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cargo</label>
          <input className={inputClass} value={testInstaladorCargo} onChange={(e) => setTestInstaladorCargo(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Data</label>
          <input type="date" className={inputClass} value={testInstaladorData} onChange={(e) => setTestInstaladorData(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Informações adicionais e anotações</label>
        <textarea rows={4} className={inputClass} value={infoAdicionais} onChange={(e) => setInfoAdicionais(e.target.value)} />
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
