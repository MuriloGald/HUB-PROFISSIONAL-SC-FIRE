"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, FileDown, Loader2, PartyPopper } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { ImageUploader } from "@/components/features/shared/image-uploader";
import { salvarPibi } from "@/app/actions/in28";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import type { Cliente } from "@/lib/supabase/types";
import type { PibiState } from "@/lib/in28/types";

const DRAFT_KEY = "scfire_in28_pibi_wizard_draft";
const STEPS = [{ label: "Imóvel/Responsáveis" }, { label: "Composição da Brigada" }, { label: "Revisão" }];

const SISTEMAS_PROTECAO_OPCOES = [
  "Extintores de incêndio",
  "Sistema de hidrantes e mangotinhos",
  "Sistema de chuveiros automáticos (sprinklers)",
  "Sistema de iluminação de emergência",
  "Sistema de alarme e detecção de incêndio",
  "Sinalização de emergência",
  "Saídas de emergência / rotas de fuga",
  "Sistema de controle de fumaça",
  "Sistema de proteção contra descargas atmosféricas (SPDA)",
  "Grupo motobomba de incêndio",
  "Reservatório de incêndio",
  "Porta corta-fogo",
  "Compartimentação horizontal/vertical",
];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface PibiWizardProps {
  clientes: Cliente[];
  clienteIdInicial?: string;
  initialState?: PibiState;
}

export function PibiWizard({ clientes, clienteIdInicial, initialState }: PibiWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<PibiState>(() => initialState ?? { step: clienteIdInicial ? 1 : 0 });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<PibiState | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [baixandoScFire, setBaixandoScFire] = useState(false);
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
            logradouro: cliente.logradouro ?? undefined,
            numero: cliente.numero ?? undefined,
            bairro: cliente.bairro ?? undefined,
            complemento: cliente.complemento ?? undefined,
            cidade: cliente.cidade ?? undefined,
            estado: cliente.estado ?? undefined,
            cep: cliente.cep ?? undefined,
            re: cliente.re ?? undefined,
          },
          razao_social: cliente.razao_social ?? cliente.nome,
          cnpj: cliente.cnpj_cpf ?? undefined,
          re: cliente.re ?? undefined,
          endereco: cliente.logradouro ?? undefined,
          numero: cliente.numero ?? undefined,
          complemento: cliente.complemento ?? undefined,
          bairro: cliente.bairro ?? undefined,
          cidade: cliente.cidade ?? undefined,
          cep: cliente.cep ?? undefined,
          telefone: cliente.telefone ?? undefined,
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

  function avancarPara(step: number, partial: Partial<PibiState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste PIBI serão perdidos.")) {
      clearDraft();
      router.push("/documentos/in28");
    }
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarPibi(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o PIBI.");
        return;
      }
      setSalvo(result.data.dados as PibiState);
    } catch (err) {
      console.error("Erro ao salvar o PIBI:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao salvar o PIBI. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  async function handleBaixar() {
    if (!salvo) return;
    setBaixando(true);
    setErro(null);
    try {
      const { gerarPdfPibi } = await import("@/lib/in28/pdf-generator");
      await gerarPdfPibi(salvo);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixando(false);
    }
  }

  /** Segunda via do PIBI, com a identidade visual da SC Fire — a oficial pro CBMSC continua sendo handleBaixar. */
  async function handleBaixarScFire() {
    if (!salvo) return;
    setBaixandoScFire(true);
    setErro(null);
    try {
      const { gerarPdfPibiIdentidadeVisual } = await import("@/lib/in28/pdf-generator");
      await gerarPdfPibiIdentidadeVisual(salvo);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixandoScFire(false);
    }
  }

  function handleConcluir() {
    clearDraft();
    router.push("/documentos/in28/pibi");
    router.refresh();
  }

  const step = state.step ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo PIBI</h1>
          <p className="text-sm text-gray-400 mt-1">IN 28/CBMSC — Anexo C — Plano de Implementação de Brigada de Incêndio.</p>
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
          redirectToNovoCliente="/documentos/in28/pibi/novo"
          titulo="Selecione o Imóvel/Responsável"
          onNext={(clienteId, cliente) =>
            avancarPara(1, {
              cliente_id: clienteId,
              cliente,
              razao_social: cliente.razao_social,
              cnpj: cliente.cnpj,
              re: cliente.re,
              endereco: cliente.logradouro,
              numero: cliente.numero,
              complemento: cliente.complemento,
              bairro: cliente.bairro,
              cidade: cliente.cidade,
              cep: cliente.cep,
              telefone: cliente.telefone,
            })
          }
        />
      )}

      {step === 1 && <StepImovelResponsaveis state={state} onBack={() => avancarPara(0)} onNext={(partial) => avancarPara(2, partial)} />}

      {step === 2 && <StepComposicaoBrigada state={state} onBack={() => avancarPara(1)} onNext={(partial) => avancarPara(3, partial)} />}

      {step === 3 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">{salvo ? "PIBI Salvo!" : "Pronto para Salvar o PIBI!"}</h3>
            <p className="text-sm text-gray-400">{salvo ? "Baixe o PDF abaixo." : "Revise os dados abaixo antes de salvar."}</p>
          </div>

          {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

          <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Razão social:</strong> {state.razao_social || "-"}</p>
            <p><strong className="text-white">RE:</strong> {state.re || "-"}</p>
            <p><strong className="text-white">Coordenador da Brigada:</strong> {state.coordenador_brigada || "-"}</p>
          </div>

          {!salvo ? (
            <div className="flex justify-center gap-3 pt-2">
              <button type="button" onClick={() => avancarPara(2)} className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar e Editar
              </button>
              <button
                type="button"
                onClick={handleSalvar}
                disabled={salvando}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {salvando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Salvar PIBI
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex justify-center flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleBaixar}
                  disabled={baixando}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {baixando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  Baixar Anexo C — PIBI (PDF)
                </button>
                <button
                  type="button"
                  onClick={handleBaixarScFire}
                  disabled={baixandoScFire}
                  title="Segunda via com a identidade visual da SC Fire (logo e dados institucionais) — não é o Anexo C oficial enviado ao CBMSC"
                  className="px-4 py-2 border border-red-500/40 hover:border-red-500 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {baixandoScFire ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  Baixar PIBI — Identidade Visual SC Fire (PDF)
                </button>
              </div>
              <div className="flex justify-center">
                <button type="button" onClick={handleConcluir} className="px-4 py-2 border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-white hover:text-emerald-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
                  <PartyPopper className="w-3.5 h-3.5" /> Concluir e Voltar para Consultar PIBIs
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepImovelResponsaveis({ state, onBack, onNext }: { state: PibiState; onBack: () => void; onNext: (partial: Partial<PibiState>) => void }) {
  const [form, setForm] = useState({
    razao_social: state.razao_social ?? "",
    nome_fantasia: state.nome_fantasia ?? "",
    cnpj: state.cnpj ?? "",
    re: state.re ?? "",
    cidade: state.cidade ?? "",
    bairro: state.bairro ?? "",
    endereco: state.endereco ?? "",
    numero: state.numero ?? "",
    complemento: state.complemento ?? "",
    ocupacao: state.ocupacao ?? "",
    cep: state.cep ?? "",
    telefone: state.telefone ?? "",
    area_construida: state.area_construida ?? "",
    pavimentos: state.pavimentos ?? "",
    altura: state.altura ?? "",
    populacao_fixa: state.populacao_fixa ?? "",
    lotacao_maxima: state.lotacao_maxima ?? "",
    responsavel_nome: state.responsavel_nome ?? "",
    responsavel_cpf: state.responsavel_cpf ?? "",
    responsavel_identidade: state.responsavel_identidade ?? "",
    responsavel_endereco: state.responsavel_endereco ?? "",
    responsavel_numero: state.responsavel_numero ?? "",
    responsavel_cidade_uf: state.responsavel_cidade_uf ?? "",
    responsavel_telefone: state.responsavel_telefone ?? "",
    rt_nome: state.rt_nome ?? "",
    rt_cpf: state.rt_cpf ?? "",
    rt_registro: state.rt_registro ?? "",
    rt_atribuicao: state.rt_atribuicao ?? "",
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
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">1. Dados do Imóvel/Evento</h4>
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
          <label className={labelClass}>Nº Registro Edificação CBMSC (RE)</label>
          <input className={inputClass} value={form.re} onChange={(e) => update("re", e.target.value)} />
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
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} value={form.cidade} onChange={(e) => update("cidade", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>CEP</label>
          <input className={inputClass} value={form.cep} onChange={(e) => update("cep", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Telefone</label>
          <input className={inputClass} value={form.telefone} onChange={(e) => update("telefone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Ocupação (ver IN-01)</label>
          <input className={inputClass} value={form.ocupacao} onChange={(e) => update("ocupacao", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Área construída (m²)</label>
          <input className={inputClass} value={form.area_construida} onChange={(e) => update("area_construida", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº de pavimentos</label>
          <input className={inputClass} value={form.pavimentos} onChange={(e) => update("pavimentos", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Altura (m)</label>
          <input className={inputClass} value={form.altura} onChange={(e) => update("altura", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>População fixa / Lotação máxima</label>
          <div className="flex gap-2">
            <input className={inputClass} value={form.populacao_fixa} onChange={(e) => update("populacao_fixa", e.target.value)} />
            <input className={inputClass} value={form.lotacao_maxima} onChange={(e) => update("lotacao_maxima", e.target.value)} />
          </div>
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">2. Dados do Responsável pelo Imóvel/Evento</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Responsável</label>
          <input className={inputClass} value={form.responsavel_nome} onChange={(e) => update("responsavel_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CPF</label>
          <input className={inputClass} value={form.responsavel_cpf} onChange={(e) => update("responsavel_cpf", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Identidade</label>
          <input className={inputClass} value={form.responsavel_identidade} onChange={(e) => update("responsavel_identidade", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>Endereço residencial</label>
          <input className={inputClass} value={form.responsavel_endereco} onChange={(e) => update("responsavel_endereco", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº</label>
          <input className={inputClass} value={form.responsavel_numero} onChange={(e) => update("responsavel_numero", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade/UF</label>
          <input className={inputClass} value={form.responsavel_cidade_uf} onChange={(e) => update("responsavel_cidade_uf", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Telefone</label>
          <input className={inputClass} value={form.responsavel_telefone} onChange={(e) => update("responsavel_telefone", e.target.value)} />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">3. Dados do Responsável Técnico</h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Responsável técnico</label>
          <input className={inputClass} value={form.rt_nome} onChange={(e) => update("rt_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CPF</label>
          <input className={inputClass} value={form.rt_cpf} onChange={(e) => update("rt_cpf", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº registro profissional</label>
          <input className={inputClass} value={form.rt_registro} onChange={(e) => update("rt_registro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Atribuição</label>
          <input className={inputClass} value={form.rt_atribuicao} onChange={(e) => update("rt_atribuicao", e.target.value)} />
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

function StepComposicaoBrigada({ state, onBack, onNext }: { state: PibiState; onBack: () => void; onNext: (partial: Partial<PibiState>) => void }) {
  const [form, setForm] = useState({
    coordenador_brigada: state.coordenador_brigada ?? "",
    brigadistas_particulares_qtd: state.brigadistas_particulares_qtd ?? "",
    brigadistas_particulares_relacao: state.brigadistas_particulares_relacao ?? "",
    brigadistas_organicos_qtd: state.brigadistas_organicos_qtd ?? "",
    brigadistas_organicos_nivel: state.brigadistas_organicos_nivel ?? "",
    brigadistas_organicos_distribuicao: state.brigadistas_organicos_distribuicao ?? "",
    sistemas_protecao: state.sistemas_protecao ?? "",
    outros_recursos: state.outros_recursos ?? "",
    procedimentos_emergencia: state.procedimentos_emergencia ?? "",
    acoes_prevencao: state.acoes_prevencao ?? "",
    outras_informacoes: state.outras_informacoes ?? "",
    local_data: state.local_data ?? "",
  });
  const [plantaCroqui, setPlantaCroqui] = useState(state.planta_croqui ?? []);
  const [novoSistema, setNovoSistema] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const sistemasSelecionados = form.sistemas_protecao
    ? form.sistemas_protecao.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  function adicionarSistema(valor: string) {
    const item = valor.trim();
    if (!item || sistemasSelecionados.includes(item)) return;
    update("sistemas_protecao", [...sistemasSelecionados, item].join(", "));
  }

  function removerSistema(valor: string) {
    update("sistemas_protecao", sistemasSelecionados.filter((s) => s !== valor).join(", "));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ ...form, planta_croqui: plantaCroqui });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">4. Composição da Brigada de Incêndio</h4>
      <div className="space-y-1.5">
        <label className={labelClass}>Coordenador da Brigada (nome e cargo/função)</label>
        <input className={inputClass} value={form.coordenador_brigada} onChange={(e) => update("coordenador_brigada", e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nº de brigadistas particulares por turno</label>
          <input className={inputClass} value={form.brigadistas_particulares_qtd} onChange={(e) => update("brigadistas_particulares_qtd", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº de brigadistas orgânicos / Nível de treinamento</label>
          <div className="flex gap-2">
            <input className={inputClass} value={form.brigadistas_organicos_qtd} onChange={(e) => update("brigadistas_organicos_qtd", e.target.value)} />
            <input className={inputClass} value={form.brigadistas_organicos_nivel} onChange={(e) => update("brigadistas_organicos_nivel", e.target.value)} />
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Relação dos brigadistas particulares por turno (nome e CPF)</label>
        <textarea
          rows={4}
          placeholder={"Ex: Turno 1 das 08:00 às 16:00h:\n- Fulano de Tal - CPF: XXX.XXX.XXX-XX"}
          className={inputClass}
          value={form.brigadistas_particulares_relacao}
          onChange={(e) => update("brigadistas_particulares_relacao", e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Distribuição dos brigadistas orgânicos por bloco/setor/área</label>
        <textarea
          rows={4}
          placeholder={"Ex: Bloco A: Total de 20 brigadistas orgânicos\nSendo: 15 no setor de expedição com 02 líderes; 05 no setor de produção com 01 líder."}
          className={inputClass}
          value={form.brigadistas_organicos_distribuicao}
          onChange={(e) => update("brigadistas_organicos_distribuicao", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Sistema de Proteção Contra Incêndios Instalados</label>
        {sistemasSelecionados.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sistemasSelecionados.map((sistema) => (
              <span key={sistema} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {sistema}
                <button type="button" onClick={() => removerSistema(sistema)} className="hover:text-red-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <select
          value=""
          className={inputClass}
          onChange={(e) => {
            if (e.target.value) adicionarSistema(e.target.value);
          }}
        >
          <option value="">+ Selecionar sistema para adicionar...</option>
          {SISTEMAS_PROTECAO_OPCOES.filter((o) => !sistemasSelecionados.includes(o)).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="Outro sistema não listado..."
            value={novoSistema}
            onChange={(e) => setNovoSistema(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionarSistema(novoSistema);
                setNovoSistema("");
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              adicionarSistema(novoSistema);
              setNovoSistema("");
            }}
            className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-400 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
          >
            Adicionar
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Outros Recursos Disponíveis (EPIs, radiocomunicação etc.)</label>
        <textarea rows={2} className={inputClass} value={form.outros_recursos} onChange={(e) => update("outros_recursos", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Procedimentos em Situação de Emergência</label>
        <textarea rows={3} className={inputClass} value={form.procedimentos_emergencia} onChange={(e) => update("procedimentos_emergencia", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Ações de Prevenção</label>
        <textarea rows={3} className={inputClass} value={form.acoes_prevencao} onChange={(e) => update("acoes_prevencao", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Outras Informações</label>
        <textarea rows={2} className={inputClass} value={form.outras_informacoes} onChange={(e) => update("outras_informacoes", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Planta e Croquis (imagens)</label>
        <ImageUploader imagens={plantaCroqui} onChange={setPlantaCroqui} />
      </div>

      <div className="space-y-1.5 max-w-xs">
        <label className={labelClass}>Local (cidade)</label>
        <input className={inputClass} value={form.local_data} onChange={(e) => update("local_data", e.target.value)} />
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
