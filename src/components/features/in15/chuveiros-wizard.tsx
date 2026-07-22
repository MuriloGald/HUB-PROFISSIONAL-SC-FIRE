"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, FileDown, Loader2, PartyPopper } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { ChecklistGenerico, RespostaToggle, ChoiceGroup } from "@/components/features/shared/resposta-toggle";
import { salvarChuveiros } from "@/app/actions/in15";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import { SECOES_CHUVEIROS, OPCOES_RISCO, OPCOES_ARMAZENAMENTO, OPCOES_SISTEMA } from "@/lib/in15/constants";
import type { Cliente } from "@/lib/supabase/types";
import type { ChuveirosState, RespostaSN } from "@/lib/in15/types";

const DRAFT_KEY = "scfire_in15_chuveiros_wizard_draft";
const STEPS = [{ label: "Identificação" }, { label: "Seções 1-3 / Ensaios" }, { label: "Seções 4-7 / Memorial" }, { label: "Conclusão" }, { label: "Revisão" }];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface ChuveirosWizardProps {
  clientes: Cliente[];
  clienteIdInicial?: string;
  initialState?: ChuveirosState;
}

export function ChuveirosWizard({ clientes, clienteIdInicial, initialState }: ChuveirosWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<ChuveirosState>(() => initialState ?? { step: clienteIdInicial ? 1 : 0, fluxo: "inspecao", respostas: {} });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<ChuveirosState | null>(null);
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
          fluxo: "inspecao",
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
          endereco: cliente.logradouro ?? undefined,
          numero: cliente.numero ?? undefined,
          complemento: cliente.complemento ?? undefined,
          bairro: cliente.bairro ?? undefined,
          municipio_uf: cliente.cidade ? `${cliente.cidade} - ${cliente.estado || "SC"}` : undefined,
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

  function avancarPara(step: number, partial: Partial<ChuveirosState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste relatório serão perdidos.")) {
      clearDraft();
      router.push("/documentos/in15");
    }
  }

  function setResposta(chave: string, resposta: string) {
    setState((s) => ({ ...s, respostas: { ...s.respostas, [chave]: resposta as RespostaSN } }));
  }

  function patch(partial: Partial<ChuveirosState>) {
    setState((s) => ({ ...s, ...partial }));
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarChuveiros(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o relatório.");
        return;
      }
      setSalvo(result.data.dados as ChuveirosState);
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
      const { gerarPdfComissionamentoChuveiros, gerarPdfInspecaoChuveiros } = await import("@/lib/in15/pdf-generator");
      if (salvo.fluxo === "comissionamento") {
        await gerarPdfComissionamentoChuveiros(salvo);
      } else {
        await gerarPdfInspecaoChuveiros(salvo);
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
    router.push("/documentos/in15/lista");
    router.refresh();
  }

  const step = state.step ?? 0;
  const isInspecao = (state.fluxo ?? "inspecao") === "inspecao";
  const respostas = state.respostas || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Relatório de Chuveiros Automáticos</h1>
          <p className="text-sm text-gray-400 mt-1">IN 15/CBMSC — Anexo B (Comissionamento) ou Anexo C (Inspeção).</p>
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
          redirectToNovoCliente="/documentos/in15/novo"
          titulo="Selecione o Responsável pelo Imóvel"
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
              responsavel_imovel_nome: cliente.razao_social,
              responsavel_imovel_email: cliente.email,
              responsavel_imovel_fone: cliente.telefone,
            })
          }
        />
      )}

      {step === 1 && <StepIdentificacao state={state} onBack={() => avancarPara(0)} onNext={(partial) => avancarPara(2, partial)} />}

      {step === 2 &&
        (isInspecao ? (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
            <ChecklistGenerico titulo={`${SECOES_CHUVEIROS[0].numero}. ${SECOES_CHUVEIROS[0].titulo}`} itens={SECOES_CHUVEIROS[0].itens} respostas={respostas} onChange={setResposta} />
            <ChecklistGenerico titulo={`${SECOES_CHUVEIROS[1].numero}. ${SECOES_CHUVEIROS[1].titulo}`} itens={SECOES_CHUVEIROS[1].itens} respostas={respostas} onChange={setResposta} />
            <ChecklistGenerico titulo={`${SECOES_CHUVEIROS[2].numero}. ${SECOES_CHUVEIROS[2].titulo}`} itens={SECOES_CHUVEIROS[2].itens} respostas={respostas} onChange={setResposta} />
            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => avancarPara(1)} className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>
              <button type="button" onClick={() => avancarPara(3)} className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                Avançar <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <StepEnsaiosComissionamento state={state} onChange={patch} onBack={() => avancarPara(1)} onNext={() => avancarPara(3)} />
        ))}

      {step === 3 &&
        (isInspecao ? (
          <StepFinalInspecao state={state} respostas={respostas} onChangeResposta={setResposta} onBack={() => avancarPara(2)} onNext={(partial) => avancarPara(4, partial)} />
        ) : (
          <StepMemorialComissionamento state={state} onBack={() => avancarPara(2)} onNext={(partial) => avancarPara(4, partial)} />
        ))}

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
            <p><strong className="text-white">Tipo:</strong> {isInspecao ? "Inspeção (Anexo C)" : "Comissionamento (Anexo B)"}</p>
            <p><strong className="text-white">Responsável pelo imóvel:</strong> {state.responsavel_imovel_nome || "-"}</p>
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
                  Baixar {isInspecao ? "Anexo C" : "Anexo B"} (PDF)
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

function StepIdentificacao({ state, onBack, onNext }: { state: ChuveirosState; onBack: () => void; onNext: (partial: Partial<ChuveirosState>) => void }) {
  const [fluxo, setFluxo] = useState(state.fluxo ?? "inspecao");
  const [form, setForm] = useState({
    endereco: state.endereco ?? "",
    numero: state.numero ?? "",
    complemento: state.complemento ?? "",
    bairro: state.bairro ?? "",
    municipio_uf: state.municipio_uf ?? "",
    re: state.re ?? "",
    responsavel_imovel_nome: state.responsavel_imovel_nome ?? "",
    responsavel_imovel_email: state.responsavel_imovel_email ?? "",
    responsavel_imovel_fone: state.responsavel_imovel_fone ?? "",
    rt_nome: state.rt_nome ?? "",
    rt_registro: state.rt_registro ?? "",
    rt_email: state.rt_email ?? "",
    rt_fone: state.rt_fone ?? "",
    ocupacao_in01: state.ocupacao_in01 ?? "",
    ocupacoes_nbr10897: state.ocupacoes_nbr10897 ?? "",
    vga_numero: state.vga_numero ?? "",
    metodo_armazenagem: state.metodo_armazenagem ?? "",
    altura_edificacao: state.altura_edificacao ?? "",
    altura_armazenagem: state.altura_armazenagem ?? "",
  });
  const [risco, setRisco] = useState(state.risco ?? "");
  const [classeArmazenamento, setClasseArmazenamento] = useState(state.classe_armazenamento ?? "");
  const [tipoSistema, setTipoSistema] = useState(state.tipo_sistema ?? "");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ ...form, fluxo, risco, classe_armazenamento: classeArmazenamento, tipo_sistema: tipoSistema });
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
      <div className="space-y-1.5 max-w-xs">
        <label className={labelClass}>RE</label>
        <input className={inputClass} value={form.re} onChange={(e) => update("re", e.target.value)} />
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

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Classificação do Sistema</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Ocupação (IN-01)</label>
          <input className={inputClass} value={form.ocupacao_in01} onChange={(e) => update("ocupacao_in01", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Ocupações (Tab. A-1 NBR 10.897)</label>
          <input className={inputClass} value={form.ocupacoes_nbr10897} onChange={(e) => update("ocupacoes_nbr10897", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Válvula de Governo e Alarme nº</label>
          <input className={inputClass} value={form.vga_numero} onChange={(e) => update("vga_numero", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Método de armazenagem</label>
          <input className={inputClass} value={form.metodo_armazenagem} onChange={(e) => update("metodo_armazenagem", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Altura de armazenagem</label>
          <input className={inputClass} value={form.altura_armazenagem} onChange={(e) => update("altura_armazenagem", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5 max-w-xs">
        <label className={labelClass}>Altura da edificação</label>
        <input className={inputClass} value={form.altura_edificacao} onChange={(e) => update("altura_edificacao", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Risco</label>
        <ChoiceGroup opcoes={OPCOES_RISCO} value={risco} onChange={setRisco} />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Armazenamento</label>
        <ChoiceGroup opcoes={OPCOES_ARMAZENAMENTO} value={classeArmazenamento} onChange={setClasseArmazenamento} />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Sistema</label>
        <ChoiceGroup opcoes={OPCOES_SISTEMA} value={tipoSistema} onChange={setTipoSistema} />
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

const ENSAIOS_B: { key: keyof ChuveirosState; label: string }[] = [
  { key: "projeto_conformidade", label: "Instalação em conformidade com o projeto?" },
  { key: "equipamento_aprovado", label: "Equipamento usado é aprovado?" },
  { key: "instrucao_realizada", label: "Responsável instruído quanto à localização de válvulas e manutenção?" },
  { key: "ensaio_hidrostatico_ok", label: "Ensaio hidrostático em condição de operação?" },
  { key: "equipamentos_funcionam", label: "Os equipamentos funcionam adequadamente?" },
  { key: "sem_aditivos_quimicos", label: "Garantido que não foram empregados aditivos/produtos químicos corrosivos nos ensaios?" },
  { key: "valvulas_controle_abertas", label: "Válvulas de controle totalmente abertas?" },
  { key: "conexoes_intercambiaveis", label: "Conexões de mangueiras intercambiáveis com as do Corpo de Bombeiros?" },
];

function StepEnsaiosComissionamento({
  state,
  onChange,
  onBack,
  onNext,
}: {
  state: ChuveirosState;
  onChange: (partial: Partial<ChuveirosState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Chuveiros Automáticos (especificações)</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Marca</label>
          <input className={inputClass} value={state.chuveiros_marca ?? ""} onChange={(e) => onChange({ chuveiros_marca: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Modelo</label>
          <input className={inputClass} value={state.chuveiros_modelo ?? ""} onChange={(e) => onChange({ chuveiros_modelo: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Ano de fabricação</label>
          <input className={inputClass} value={state.chuveiros_ano ?? ""} onChange={(e) => onChange({ chuveiros_ano: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Tamanho do orifício</label>
          <input className={inputClass} value={state.chuveiros_orificio ?? ""} onChange={(e) => onChange({ chuveiros_orificio: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Quantidade</label>
          <input className={inputClass} value={state.chuveiros_qtd ?? ""} onChange={(e) => onChange({ chuveiros_qtd: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Temperatura de operação</label>
          <input className={inputClass} value={state.chuveiros_temperatura ?? ""} onChange={(e) => onChange({ chuveiros_temperatura: e.target.value })} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Ensaios Principais</h4>
      <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] overflow-hidden">
        {ENSAIOS_B.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02]">
            <span className="text-xs text-gray-300 flex-1">{item.label}</span>
            <RespostaToggle value={(state[item.key] as string) ?? ""} onChange={(v) => onChange({ [item.key]: v } as Partial<ChuveirosState>)} />
          </div>
        ))}
      </div>

      <textarea
        rows={2}
        placeholder="Se não, explicar divergências"
        className={inputClass}
        value={state.divergencias ?? ""}
        onChange={(e) => onChange({ divergencias: e.target.value })}
      />
      <input
        placeholder="Nome do responsável instruído"
        className={inputClass}
        value={state.nome_responsavel_instruido ?? ""}
        onChange={(e) => onChange({ nome_responsavel_instruido: e.target.value })}
      />

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button type="button" onClick={onNext} className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2">
          Avançar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function StepMemorialComissionamento({
  state,
  onBack,
  onNext,
}: {
  state: ChuveirosState;
  onBack: () => void;
  onNext: (partial: Partial<ChuveirosState>) => void;
}) {
  const [memorial, setMemorial] = useState(state.memorial_tecnico_complementar ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ memorial_tecnico_complementar: memorial });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="space-y-1.5">
        <label className={labelClass}>
          Memorial técnico complementar (ensaios hidrostáticos, soldagem, flush test, teste de vazamentos, hidrantes etc. — descreva livremente os
          resultados dos ensaios adicionais exigidos pela NBR 10.897)
        </label>
        <textarea rows={10} className={inputClass} value={memorial} onChange={(e) => setMemorial(e.target.value)} />
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

function StepFinalInspecao({
  state,
  respostas,
  onChangeResposta,
  onBack,
  onNext,
}: {
  state: ChuveirosState;
  respostas: Record<string, string>;
  onChangeResposta: (chave: string, resposta: string) => void;
  onBack: () => void;
  onNext: (partial: Partial<ChuveirosState>) => void;
}) {
  const [chuveirosRelacao, setChuveirosRelacao] = useState(state.chuveiros_relacao ?? "");
  const [justificativas, setJustificativas] = useState(state.justificativas ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ chuveiros_relacao: chuveirosRelacao, justificativas });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <ChecklistGenerico titulo={`${SECOES_CHUVEIROS[3].numero}. ${SECOES_CHUVEIROS[3].titulo}`} itens={SECOES_CHUVEIROS[3].itens} respostas={respostas} onChange={onChangeResposta} />
      <ChecklistGenerico titulo={`${SECOES_CHUVEIROS[4].numero}. ${SECOES_CHUVEIROS[4].titulo}`} itens={SECOES_CHUVEIROS[4].itens} respostas={respostas} onChange={onChangeResposta} />
      <ChecklistGenerico titulo={`${SECOES_CHUVEIROS[5].numero}. ${SECOES_CHUVEIROS[5].titulo}`} itens={SECOES_CHUVEIROS[5].itens} respostas={respostas} onChange={onChangeResposta} />
      <ChecklistGenerico titulo={`${SECOES_CHUVEIROS[6].numero}. ${SECOES_CHUVEIROS[6].titulo}`} itens={SECOES_CHUVEIROS[6].itens} respostas={respostas} onChange={onChangeResposta} />

      <div className="space-y-1.5">
        <label className={labelClass}>Relação dos chuveiros automáticos (tipo, fabricante, código, ano, tempo de resposta, posição, temperatura)</label>
        <textarea rows={3} className={inputClass} value={chuveirosRelacao} onChange={(e) => setChuveirosRelacao(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Justificativas técnicas para não atendimento dos itens assinalados</label>
        <textarea rows={4} className={inputClass} value={justificativas} onChange={(e) => setJustificativas(e.target.value)} />
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

function StepConclusao({ state, onBack, onNext }: { state: ChuveirosState; onBack: () => void; onNext: (partial: Partial<ChuveirosState>) => void }) {
  const [conclusao, setConclusao] = useState<RespostaSN>(state.conclusao ?? "");
  const [dataEntrega, setDataEntrega] = useState(state.data_entrega_ou_inspecao ?? "");
  const [nomeInstalador, setNomeInstalador] = useState(state.nome_instalador ?? "");
  const [infoAdicionais, setInfoAdicionais] = useState(state.informacoes_adicionais ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ conclusao, data_entrega_ou_inspecao: dataEntrega, nome_instalador: nomeInstalador, informacoes_adicionais: infoAdicionais });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02] rounded-lg border border-white/[0.08]">
        <span className="text-xs text-gray-300 flex-1">Após a realização e verificação dos ensaios, o sistema se encontra em condição de operação?</span>
        <RespostaToggle value={conclusao} onChange={(v) => setConclusao(v as RespostaSN)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Data</label>
          <input type="date" className={inputClass} value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nome do instalador (se comissionamento)</label>
          <input className={inputClass} value={nomeInstalador} onChange={(e) => setNomeInstalador(e.target.value)} />
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
