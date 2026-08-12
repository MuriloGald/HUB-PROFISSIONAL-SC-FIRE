"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, FileDown, Loader2, PartyPopper } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { ProfissionalCampoSelect } from "@/components/features/profissionais/profissional-campo-select";
import { ChecklistSecao } from "./checklist-secao";
import { salvarComissionamentoSHP } from "@/app/actions/in07";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import { SECOES_SHP } from "@/lib/in07/constants";
import type { Cliente, Profissional } from "@/lib/supabase/types";
import type { ComissionamentoSHPState, RespostaChecklist } from "@/lib/in07/types";

const DRAFT_KEY = "scfire_in07_shp_wizard_draft";
const STEPS = [{ label: "Identificação" }, { label: "Hidrantes/Bomba" }, { label: "Tubulação/Reservatórios" }, { label: "Teste/Vazão" }, { label: "Revisão" }];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface ShpWizardProps {
  clientes: Cliente[];
  profissionais: Profissional[];
  clienteIdInicial?: string;
  initialState?: ComissionamentoSHPState;
}

export function ShpWizard({ clientes, profissionais, clienteIdInicial, initialState }: ShpWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<ComissionamentoSHPState>(() => initialState ?? { step: clienteIdInicial ? 1 : 0, respostas: {} });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<ComissionamentoSHPState | null>(null);
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
          endereco: cliente.logradouro ?? undefined,
          numero: cliente.numero ?? undefined,
          complemento: cliente.complemento ?? undefined,
          bairro: cliente.bairro ?? undefined,
          municipio_uf: cliente.cidade ? `${cliente.cidade} - ${cliente.estado || "SC"}` : undefined,
          re: cliente.re ?? undefined,
          proprietario_nome: cliente.razao_social ?? cliente.nome,
          proprietario_email: cliente.email ?? undefined,
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

  function avancarPara(step: number, partial: Partial<ComissionamentoSHPState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste relatório serão perdidos.")) {
      clearDraft();
      router.push("/documentos/in07");
    }
  }

  function setResposta(chave: string, resposta: RespostaChecklist) {
    setState((s) => ({ ...s, respostas: { ...s.respostas, [chave]: resposta } }));
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarComissionamentoSHP(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o relatório.");
        return;
      }
      setSalvo(result.data.dados as ComissionamentoSHPState);
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
      const { gerarPdfComissionamentoSHP } = await import("@/lib/in07/pdf-generator");
      await gerarPdfComissionamentoSHP(salvo);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixando(false);
    }
  }

  function handleConcluir() {
    clearDraft();
    router.push("/documentos/in07/lista");
    router.refresh();
  }

  const step = state.step ?? 0;
  const respostas = state.respostas || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Relatório de Comissionamento do SHP</h1>
          <p className="text-sm text-gray-400 mt-1">IN 07/CBMSC — Anexo C — Sistema de Hidrantes e Mangotinhos.</p>
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
          redirectToNovoCliente="/documentos/in07/novo"
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
            })
          }
        />
      )}

      {step === 1 && (
        <StepIdentificacao state={state} profissionais={profissionais} onBack={() => avancarPara(0)} onNext={(partial) => avancarPara(2, partial)} />
      )}

      {step === 2 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <ChecklistSecao secao={SECOES_SHP[0]} respostas={respostas} onChange={setResposta} />
          <ChecklistSecao secao={SECOES_SHP[1]} respostas={respostas} onChange={setResposta} />
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => avancarPara(1)}
              className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <button
              type="button"
              onClick={() => avancarPara(3)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              Avançar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <ChecklistSecao secao={SECOES_SHP[2]} respostas={respostas} onChange={setResposta} />
          <ChecklistSecao secao={SECOES_SHP[3]} respostas={respostas} onChange={setResposta} />
          <ChecklistSecao secao={SECOES_SHP[4]} respostas={respostas} onChange={setResposta} />
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => avancarPara(2)}
              className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <button
              type="button"
              onClick={() => avancarPara(4)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              Avançar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <StepTesteVazao
          state={state}
          respostas={respostas}
          onChangeResposta={setResposta}
          onBack={() => avancarPara(3)}
          onNext={(partial) => avancarPara(5, partial)}
        />
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
            <p><strong className="text-white">Proprietário:</strong> {state.proprietario_nome || "-"}</p>
            <p><strong className="text-white">RE:</strong> {state.re || "-"}</p>
            <p><strong className="text-white">Responsável Técnico:</strong> {state.rt?.nome || "-"}</p>
            <p><strong className="text-white">Itens avaliados:</strong> {Object.values(respostas).filter((v) => v).length} de {SECOES_SHP.reduce((n, s) => n + s.itens.length, 0)}</p>
            <p><strong className="text-white">Vazão medida:</strong> {state.vazao_medida || "-"} l/min</p>
          </div>

          {!salvo ? (
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => avancarPara(4)}
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
                  Baixar Anexo C (PDF)
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleConcluir}
                  className="px-4 py-2 border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-white hover:text-emerald-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
                >
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
  state: ComissionamentoSHPState;
  profissionais: Profissional[];
  onBack: () => void;
  onNext: (partial: Partial<ComissionamentoSHPState>) => void;
}) {
  const [form, setForm] = useState({
    endereco: state.endereco ?? "",
    numero: state.numero ?? "",
    complemento: state.complemento ?? "",
    bairro: state.bairro ?? "",
    municipio_uf: state.municipio_uf ?? "",
    re: state.re ?? "",
    proprietario_nome: state.proprietario_nome ?? "",
    proprietario_email: state.proprietario_email ?? "",
    responsavel_uso_nome: state.responsavel_uso_nome ?? "",
    responsavel_uso_email: state.responsavel_uso_email ?? "",
    rt_id: state.rt_id ?? "",
    rt: state.rt,
    ocupacao_tipo: state.ocupacao_tipo ?? "",
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
          <label className={labelClass}>Ocupação e tipo (Tabela 1, Anexo B da IN 1 parte 2)</label>
          <input className={inputClass} value={form.ocupacao_tipo} onChange={(e) => update("ocupacao_tipo", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Proprietário</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome</label>
          <input className={inputClass} value={form.proprietario_nome} onChange={(e) => update("proprietario_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>E-mail</label>
          <input className={inputClass} value={form.proprietario_email} onChange={(e) => update("proprietario_email", e.target.value)} />
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
        redirectToNovoProfissional="/documentos/in07/novo"
        onChange={(id, p) => setForm((f) => ({ ...f, rt_id: id, rt: p }))}
      />

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

function StepTesteVazao({
  state,
  respostas,
  onChangeResposta,
  onBack,
  onNext,
}: {
  state: ComissionamentoSHPState;
  respostas: Record<string, RespostaChecklist>;
  onChangeResposta: (chave: string, resposta: RespostaChecklist) => void;
  onBack: () => void;
  onNext: (partial: Partial<ComissionamentoSHPState>) => void;
}) {
  const [vazao, setVazao] = useState(state.vazao_medida ?? "");
  const [justificativas, setJustificativas] = useState(state.justificativas ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ vazao_medida: vazao, justificativas });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <ChecklistSecao secao={SECOES_SHP[5]} respostas={respostas} onChange={onChangeResposta} />

      <div className="space-y-1.5">
        <label className={labelClass}>6.2 Teste de vazão — valor medido no hidrante menos favorável hidraulicamente (l/min)</label>
        <input className={`${inputClass} max-w-xs`} value={vazao} onChange={(e) => setVazao(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Justificativas técnicas para não atendimento dos itens assinalados</label>
        <textarea rows={5} className={inputClass} value={justificativas} onChange={(e) => setJustificativas(e.target.value)} />
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
