"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Bell, Check, CheckCircle2, Droplets, FileDown, FireExtinguisher, GlassWater, Lightbulb, Loader2, PartyPopper, Plus, Trash2, X } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { ProfissionalCampoSelect } from "@/components/features/profissionais/profissional-campo-select";
import { ImageUploader } from "@/components/features/shared/image-uploader";
import { salvarLaudoTecnico } from "@/app/actions/laudos-tecnicos";
import { buscarUltimaVistoriaManutencaoPorCliente } from "@/app/actions/in04";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import { LAUDOS_TECNICOS_CONFIG, LAUDOS_TECNICOS_LABELS } from "@/lib/laudos-tecnicos/constants";
import type { LaudoTecnicoConfig } from "@/lib/laudos-tecnicos/constants";
import { novaMedicaoAlarme, novaMedicaoIluminacao, novaMedicaoGas, novaMedicaoExtintor, novaMedicaoShp } from "@/lib/laudos-tecnicos/types";
import { resultadoAlarme, resultadoIluminacao, resultadoGas, resultadoExtintor, resultadoShp } from "@/lib/laudos-tecnicos/resultado";
import type { Cliente, Profissional } from "@/lib/supabase/types";
import type { ClienteSnapshot } from "@/lib/clientes/types";
import type { ProfissionalSnapshot } from "@/lib/profissionais/types";
import type { LaudoTecnicoTipo, LaudoTecnicoWizardState, MedicaoAlarme, MedicaoIluminacao, MedicaoGas, MedicaoExtintor, MedicaoShp, ResultadoMedicao } from "@/lib/laudos-tecnicos/types";
import type { CategoriaKey, VistoriaManutencaoState } from "@/lib/in04/types";

/** Extrai, de todos os pavimentos da vistoria, os equipamentos lançados numa categoria (ex.: "alarme", "gas"). */
function extrairEquipamentosDaVistoria(vistoria: VistoriaManutencaoState, categoria: CategoriaKey) {
  return vistoria.pavimentos.flatMap((p) => (p.itens[categoria] ?? []).map((eq) => ({ pavimento: p.nome, identificacao: eq.identificacao })));
}

function rotuloLocal(pavimento: string, identificacao: string) {
  if (pavimento && identificacao) return `${pavimento} — ${identificacao}`;
  return identificacao || pavimento;
}

/** Monta os campos pré-preenchidos do Laudo Técnico a partir da Inspeção de Regularidade (IN 04) mais recente do cliente. */
function prefillDaVistoria(vistoria: VistoriaManutencaoState, tipo: LaudoTecnicoTipo): Partial<LaudoTecnicoWizardState> {
  const base: Partial<LaudoTecnicoWizardState> = {
    rt_id: vistoria.rt?.id,
    rt: vistoria.rt,
    data_vistoria: vistoria.data_vistoria,
  };

  if (tipo === "alarme") {
    const equipamentos = extrairEquipamentosDaVistoria(vistoria, "alarme");
    if (equipamentos.length === 0) return base;
    return {
      ...base,
      medicoesAlarme: equipamentos.map((eq) => ({ id: crypto.randomUUID(), local: rotuloLocal(eq.pavimento, eq.identificacao), nivelLocalDb: "", nivelAlarmeDb: "" })),
    };
  }

  if (tipo === "iluminacao") {
    if (vistoria.pavimentos.length === 0) return base;
    return {
      ...base,
      medicoesIluminacao: vistoria.pavimentos.map((p) => ({ id: crypto.randomUUID(), pavimento: p.nome, medicaoPlanoLux: "", medicaoDesnivelLux: "" })),
    };
  }

  if (tipo === "gas") {
    const equipamentos = extrairEquipamentosDaVistoria(vistoria, "gas");
    if (equipamentos.length === 0) return base;
    return {
      ...base,
      medicoesGas: equipamentos.map((eq) => ({ id: crypto.randomUUID(), redeTestada: rotuloLocal(eq.pavimento, eq.identificacao), estanque: "" as const, data: "" })),
    };
  }

  if (tipo === "extintor") {
    const equipamentos = extrairEquipamentosDaVistoria(vistoria, "extintores");
    if (equipamentos.length === 0) return base;
    return {
      ...base,
      medicoesExtintor: equipamentos.map((eq) => ({ id: crypto.randomUUID(), identificacao: rotuloLocal(eq.pavimento, eq.identificacao), tipoCapacidade: "", validadeRecarga: "", validadeTesteHidrostatico: "", resultado: "" as const })),
    };
  }

  const equipamentos = extrairEquipamentosDaVistoria(vistoria, "hidrantes");
  if (equipamentos.length === 0) return base;
  return {
    ...base,
    medicoesShp: equipamentos.map((eq) => ({ id: crypto.randomUUID(), identificacao: rotuloLocal(eq.pavimento, eq.identificacao), pressaoDinamica: "", vazaoLmin: "", resultado: "" as const })),
  };
}

/** Só importa se o bloco de medições do tipo escolhido ainda estiver vazio — evita sobrescrever edições já feitas ao voltar e reselecionar o cliente. */
function medicoesVazias(tipo: LaudoTecnicoTipo, state: LaudoTecnicoWizardState) {
  if (tipo === "alarme") return (state.medicoesAlarme ?? []).every((m) => !m.local && !m.nivelLocalDb && !m.nivelAlarmeDb);
  if (tipo === "iluminacao") return (state.medicoesIluminacao ?? []).every((m) => !m.pavimento && !m.medicaoPlanoLux && !m.medicaoDesnivelLux);
  if (tipo === "gas") return (state.medicoesGas ?? []).every((m) => !m.redeTestada && !m.estanque && !m.data);
  if (tipo === "extintor") return (state.medicoesExtintor ?? []).every((m) => !m.identificacao && !m.tipoCapacidade && !m.validadeRecarga && !m.resultado);
  return (state.medicoesShp ?? []).every((m) => !m.identificacao && !m.pressaoDinamica && !m.vazaoLmin && !m.resultado);
}

const DRAFT_KEY = "scfire_laudos_tecnicos_wizard_draft";
const STEPS = [{ label: "Tipo" }, { label: "Cliente" }, { label: "Identificação" }, { label: "Medições" }, { label: "Fotos" }, { label: "Revisão" }];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

const TIPO_ICON: Record<LaudoTecnicoTipo, typeof Bell> = { extintor: FireExtinguisher, iluminacao: Lightbulb, shp: GlassWater, alarme: Bell, gas: Droplets };

function badgeResultado(r: ResultadoMedicao) {
  if (r === "aprovado") return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">APROVADO</span>;
  if (r === "reprovado") return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">REPROVADO</span>;
  return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/[0.04] text-gray-500 border border-white/[0.08]">—</span>;
}

interface WizardProps {
  clientes: Cliente[];
  profissionais: Profissional[];
  initialState?: LaudoTecnicoWizardState;
}

export function LaudoTecnicoWizard({ clientes, profissionais, initialState }: WizardProps) {
  const router = useRouter();
  const [state, setState] = useState<LaudoTecnicoWizardState>(() => initialState ?? { step: 0 });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<LaudoTecnicoWizardState | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);
  const [origemVistoria, setOrigemVistoria] = useState<{ codigo?: string; data_vistoria?: string } | null>(null);

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

  function avancarPara(step: number, partial: Partial<LaudoTecnicoWizardState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste laudo serão perdidos.")) {
      clearDraft();
      router.push("/documentos/laudos-tecnicos");
    }
  }

  function escolherTipo(tipo: LaudoTecnicoTipo) {
    const config = LAUDOS_TECNICOS_CONFIG[tipo];
    avancarPara(1, {
      tipo,
      instrumento: state.instrumento || config.instrumentoDefault,
      medicoesExtintor: tipo === "extintor" ? state.medicoesExtintor ?? [novaMedicaoExtintor()] : state.medicoesExtintor,
      medicoesShp: tipo === "shp" ? state.medicoesShp ?? [novaMedicaoShp()] : state.medicoesShp,
      medicoesAlarme: tipo === "alarme" ? state.medicoesAlarme ?? [novaMedicaoAlarme()] : state.medicoesAlarme,
      medicoesIluminacao: tipo === "iluminacao" ? state.medicoesIluminacao ?? [novaMedicaoIluminacao()] : state.medicoesIluminacao,
      medicoesGas: tipo === "gas" ? state.medicoesGas ?? [novaMedicaoGas()] : state.medicoesGas,
    });
  }

  async function handleClienteSelecionado(clienteId: string, cliente: ClienteSnapshot) {
    const partial: Partial<LaudoTecnicoWizardState> = { cliente_id: clienteId, cliente };

    if (state.tipo && medicoesVazias(state.tipo, state)) {
      setImportando(true);
      try {
        const result = await buscarUltimaVistoriaManutencaoPorCliente(clienteId);
        const vistoria = "data" in result ? result.data : null;
        if (vistoria) {
          const dados = vistoria.dados as unknown as VistoriaManutencaoState;
          Object.assign(partial, prefillDaVistoria(dados, state.tipo));
          setOrigemVistoria({ codigo: dados.codigo, data_vistoria: dados.data_vistoria });
        } else {
          setOrigemVistoria(null);
        }
      } catch (err) {
        console.error("Erro ao importar dados da Inspeção de Regularidade:", err);
        setOrigemVistoria(null);
      } finally {
        setImportando(false);
      }
    }

    avancarPara(2, partial);
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarLaudoTecnico(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o laudo.");
        return;
      }
      setSalvo(result.data.dados as unknown as LaudoTecnicoWizardState);
    } catch (err) {
      console.error("Erro ao salvar o laudo:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao salvar o laudo. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  async function handleBaixar() {
    if (!salvo) return;
    setBaixando(true);
    setErro(null);
    try {
      const { gerarPdfLaudoTecnico } = await import("@/lib/laudos-tecnicos/pdf-generator");
      await gerarPdfLaudoTecnico(salvo);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixando(false);
    }
  }

  function handleConcluir() {
    clearDraft();
    router.push("/documentos/laudos-tecnicos/lista");
    router.refresh();
  }

  const step = state.step ?? 0;
  const config = state.tipo ? LAUDOS_TECNICOS_CONFIG[state.tipo] : undefined;

  const qtdReprovados =
    state.tipo === "extintor"
      ? (state.medicoesExtintor ?? []).filter((m) => resultadoExtintor(m) === "reprovado").length
      : state.tipo === "shp"
        ? (state.medicoesShp ?? []).filter((m) => resultadoShp(m) === "reprovado").length
        : state.tipo === "alarme"
          ? (state.medicoesAlarme ?? []).filter((m) => resultadoAlarme(m) === "reprovado").length
          : state.tipo === "iluminacao"
            ? (state.medicoesIluminacao ?? []).filter((m) => resultadoIluminacao(m) === "reprovado").length
            : (state.medicoesGas ?? []).filter((m) => resultadoGas(m) === "reprovado").length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Laudo Técnico</h1>
          <p className="text-sm text-gray-400 mt-1">Decorrente da Inspeção de Regularidade (IN 04) — um laudo por sistema preventivo: Extintores, Iluminação de Emergência, SHP, Alarme ou Rede de Gás.</p>
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
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-5">
          <h3 className="text-lg font-bold text-white">Qual laudo você vai emitir?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(Object.keys(LAUDOS_TECNICOS_LABELS) as LaudoTecnicoTipo[]).map((tipo) => {
              const Icon = TIPO_ICON[tipo];
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => escolherTipo(tipo)}
                  className={`group flex flex-col items-start gap-3 p-5 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                    state.tipo === tipo ? "bg-red-500/10 border-red-500/50" : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center shadow-lg shadow-black/30">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white">{LAUDOS_TECNICOS_LABELS[tipo]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <ClientePicker
            clientes={clientes}
            clienteIdInicial={state.cliente_id}
            redirectToNovoCliente="/documentos/laudos-tecnicos/novo"
            titulo="Selecione o Cliente"
            onNext={handleClienteSelecionado}
          />
          {importando && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando dados da última Inspeção de Regularidade (IN 04) deste cliente…
            </div>
          )}
        </div>
      )}

      {step === 2 && config && (
        <StepIdentificacao
          state={state}
          config={config}
          profissionais={profissionais}
          origemVistoria={origemVistoria}
          onBack={() => avancarPara(1)}
          onNext={(partial) => avancarPara(3, partial)}
        />
      )}

      {step === 3 && state.tipo === "extintor" && (
        <StepMedicoesExtintor
          medicoes={state.medicoesExtintor ?? []}
          onChange={(medicoesExtintor) => setState((s) => ({ ...s, medicoesExtintor }))}
          onBack={() => avancarPara(2)}
          onNext={() => avancarPara(4)}
        />
      )}
      {step === 3 && state.tipo === "shp" && (
        <StepMedicoesShp
          medicoes={state.medicoesShp ?? []}
          onChange={(medicoesShp) => setState((s) => ({ ...s, medicoesShp }))}
          onBack={() => avancarPara(2)}
          onNext={() => avancarPara(4)}
        />
      )}
      {step === 3 && state.tipo === "alarme" && (
        <StepMedicoesAlarme
          medicoes={state.medicoesAlarme ?? []}
          onChange={(medicoesAlarme) => setState((s) => ({ ...s, medicoesAlarme }))}
          onBack={() => avancarPara(2)}
          onNext={() => avancarPara(4)}
        />
      )}
      {step === 3 && state.tipo === "iluminacao" && (
        <StepMedicoesIluminacao
          medicoes={state.medicoesIluminacao ?? []}
          onChange={(medicoesIluminacao) => setState((s) => ({ ...s, medicoesIluminacao }))}
          onBack={() => avancarPara(2)}
          onNext={() => avancarPara(4)}
        />
      )}
      {step === 3 && state.tipo === "gas" && (
        <StepMedicoesGas state={state} onChange={(partial) => setState((s) => ({ ...s, ...partial }))} onBack={() => avancarPara(2)} onNext={() => avancarPara(4)} />
      )}

      {step === 4 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Evidência fotográfica e observações</h4>
          <div className="space-y-1.5">
            <label className={labelClass}>Fotos de amostragem</label>
            <ImageUploader imagens={state.imagens ?? []} onChange={(imagens) => setState((s) => ({ ...s, imagens }))} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Observações gerais</label>
            <textarea
              rows={3}
              className={inputClass}
              value={state.observacoes ?? ""}
              onChange={(e) => setState((s) => ({ ...s, observacoes: e.target.value }))}
            />
          </div>
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => avancarPara(3)}
              className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <button
              type="button"
              onClick={() => avancarPara(5)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              Revisar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 5 && config && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">{salvo ? "Laudo Salvo!" : "Pronto para Salvar o Laudo!"}</h3>
            <p className="text-sm text-gray-400">{salvo ? "Baixe o relatório em PDF abaixo." : "Revise o resumo abaixo antes de salvar."}</p>
          </div>

          {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

          <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Laudo:</strong> {LAUDOS_TECNICOS_LABELS[state.tipo!]}</p>
            <p><strong className="text-white">Cliente:</strong> {state.cliente?.razao_social || "-"}</p>
            <p><strong className="text-white">Data da vistoria:</strong> {state.data_vistoria || "-"}</p>
            <p>
              <strong className="text-white">Resultado das medições:</strong>{" "}
              <span className={qtdReprovados > 0 ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>
                {qtdReprovados > 0 ? `${qtdReprovados} reprovação(ões)` : "Todas aprovadas"}
              </span>
            </p>
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
                Salvar Laudo
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
                  Baixar Laudo (PDF)
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleConcluir}
                  className="px-4 py-2 border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-white hover:text-emerald-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <PartyPopper className="w-3.5 h-3.5" /> Concluir e Voltar para Consultar Laudos
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
  config,
  profissionais,
  origemVistoria,
  onBack,
  onNext,
}: {
  state: LaudoTecnicoWizardState;
  config: LaudoTecnicoConfig;
  profissionais: Profissional[];
  origemVistoria: { codigo?: string; data_vistoria?: string } | null;
  onBack: () => void;
  onNext: (partial: Partial<LaudoTecnicoWizardState>) => void;
}) {
  const [form, setForm] = useState({
    rt_id: state.rt_id ?? "",
    rt: state.rt as ProfissionalSnapshot | undefined,
    data_vistoria: state.data_vistoria ?? new Date().toISOString().slice(0, 10),
    instrumento: state.instrumento ?? config.instrumentoDefault,
    numeroSerie: state.numeroSerie ?? "",
    certificadoCalibracao: state.certificadoCalibracao ?? "",
    artNumero: state.artNumero ?? "",
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
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Identificação do laudo — {config.subtitulo}</h4>
      {origemVistoria && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          Identificação e pontos de medição importados da Inspeção de Regularidade {origemVistoria.codigo ?? ""} de {origemVistoria.data_vistoria ?? "-"}. Revise antes de continuar.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfissionalCampoSelect
          profissionais={profissionais}
          value={form.rt_id}
          label="Responsável Técnico (RT)"
          redirectToNovoProfissional="/documentos/laudos-tecnicos/novo"
          onChange={(id, p) => setForm((f) => ({ ...f, rt_id: id, rt: p }))}
        />
        <div className="space-y-1.5">
          <label className={labelClass}>Data da vistoria</label>
          <input type="date" className={inputClass} value={form.data_vistoria} onChange={(e) => update("data_vistoria", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Instrumento utilizado</label>
          <input className={inputClass} value={form.instrumento} onChange={(e) => update("instrumento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº de série</label>
          <input className={inputClass} value={form.numeroSerie} onChange={(e) => update("numeroSerie", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Certificado de calibração</label>
          <input className={inputClass} value={form.certificadoCalibracao} onChange={(e) => update("certificadoCalibracao", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>ART nº (opcional)</label>
          <input className={inputClass} value={form.artNumero} onChange={(e) => update("artNumero", e.target.value)} />
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
          Ir para as Medições <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}

function BotoesNavegacaoMedicoes({ onBack, onNext, onAdicionar, labelAdicionar }: { onBack: () => void; onNext: () => void; onAdicionar: () => void; labelAdicionar: string }) {
  return (
    <div className="flex justify-between pt-2">
      <button
        type="button"
        onClick={onBack}
        className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar
      </button>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAdicionar}
          className="px-4 py-2 border border-dashed border-white/[0.15] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" /> {labelAdicionar}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Continuar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function StepMedicoesExtintor({
  medicoes,
  onChange,
  onBack,
  onNext,
}: {
  medicoes: MedicaoExtintor[];
  onChange: (medicoes: MedicaoExtintor[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function update(id: string, patch: Partial<MedicaoExtintor>) {
    onChange(medicoes.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function remover(id: string) {
    onChange(medicoes.filter((m) => m.id !== id));
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-5">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Resultados das medições — Extintores de Incêndio</h4>
      <p className="text-xs text-gray-500">O critério de aprovação (faixa do manômetro, peso do CO2, prazos) varia por tipo de agente extintor — lance o resultado manualmente para cada extintor.</p>
      <div className="space-y-3">
        {medicoes.map((m, i) => (
          <div key={m.id} className="rounded-xl bg-black/20 border border-white/[0.08] p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <label className={labelClass}>Identificação {i + 1}</label>
              <input className={inputClass} value={m.identificacao} onChange={(e) => update(m.id, { identificacao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Tipo/Capacidade</label>
              <input className={inputClass} placeholder="Ex.: PQS 6kg" value={m.tipoCapacidade} onChange={(e) => update(m.id, { tipoCapacidade: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Validade da recarga</label>
              <input type="date" className={inputClass} value={m.validadeRecarga} onChange={(e) => update(m.id, { validadeRecarga: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Validade do teste hidrostático</label>
              <input type="date" className={inputClass} value={m.validadeTesteHidrostatico} onChange={(e) => update(m.id, { validadeTesteHidrostatico: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Resultado</label>
              <select className={inputClass} value={m.resultado} onChange={(e) => update(m.id, { resultado: e.target.value as ResultadoMedicao })}>
                <option value="" className="bg-[#111625]">--</option>
                <option value="aprovado" className="bg-[#111625]">Aprovado</option>
                <option value="reprovado" className="bg-[#111625]">Reprovado</option>
              </select>
            </div>
            <button type="button" onClick={() => remover(m.id)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <BotoesNavegacaoMedicoes onBack={onBack} onNext={onNext} onAdicionar={() => onChange([...medicoes, novaMedicaoExtintor()])} labelAdicionar="Adicionar extintor" />
    </div>
  );
}

function StepMedicoesShp({
  medicoes,
  onChange,
  onBack,
  onNext,
}: {
  medicoes: MedicaoShp[];
  onChange: (medicoes: MedicaoShp[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function update(id: string, patch: Partial<MedicaoShp>) {
    onChange(medicoes.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function remover(id: string) {
    onChange(medicoes.filter((m) => m.id !== id));
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-5">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Resultados das medições — SHP (Hidrantes/Mangotinhos)</h4>
      <p className="text-xs text-gray-500">A pressão e a vazão mínimas exigidas variam com a classificação de risco/altura da edificação (projeto aprovado) — lance o resultado manualmente para cada ponto.</p>
      <div className="space-y-3">
        {medicoes.map((m, i) => (
          <div key={m.id} className="rounded-xl bg-black/20 border border-white/[0.08] p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <label className={labelClass}>Ponto testado {i + 1}</label>
              <input className={inputClass} value={m.identificacao} onChange={(e) => update(m.id, { identificacao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Pressão dinâmica</label>
              <input className={inputClass} placeholder="Ex.: 10 mca" value={m.pressaoDinamica} onChange={(e) => update(m.id, { pressaoDinamica: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Vazão (L/min)</label>
              <input className={inputClass} value={m.vazaoLmin} onChange={(e) => update(m.id, { vazaoLmin: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Resultado</label>
              <select className={inputClass} value={m.resultado} onChange={(e) => update(m.id, { resultado: e.target.value as ResultadoMedicao })}>
                <option value="" className="bg-[#111625]">--</option>
                <option value="aprovado" className="bg-[#111625]">Aprovado</option>
                <option value="reprovado" className="bg-[#111625]">Reprovado</option>
              </select>
            </div>
            <button type="button" onClick={() => remover(m.id)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <BotoesNavegacaoMedicoes onBack={onBack} onNext={onNext} onAdicionar={() => onChange([...medicoes, novaMedicaoShp()])} labelAdicionar="Adicionar ponto testado" />
    </div>
  );
}

function StepMedicoesAlarme({
  medicoes,
  onChange,
  onBack,
  onNext,
}: {
  medicoes: MedicaoAlarme[];
  onChange: (medicoes: MedicaoAlarme[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function update(id: string, patch: Partial<MedicaoAlarme>) {
    onChange(medicoes.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function remover(id: string) {
    onChange(medicoes.filter((m) => m.id !== id));
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-5">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Resultados das medições — Alarme (dB(A))</h4>
      <p className="text-xs text-gray-500">Aprovado automaticamente quando o nível em alarme fica ≥ 15 dB(A) acima do nível de ruído local (IN 12/CBMSC).</p>
      <div className="space-y-3">
        {medicoes.map((m, i) => (
          <div key={m.id} className="rounded-xl bg-black/20 border border-white/[0.08] p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <label className={labelClass}>Localização {i + 1}</label>
              <input className={inputClass} value={m.local} onChange={(e) => update(m.id, { local: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Nível local dB(A)</label>
              <input className={inputClass} value={m.nivelLocalDb} onChange={(e) => update(m.id, { nivelLocalDb: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Nível em alarme dB(A)</label>
              <input className={inputClass} value={m.nivelAlarmeDb} onChange={(e) => update(m.id, { nivelAlarmeDb: e.target.value })} />
            </div>
            <div className="pb-2">{badgeResultado(resultadoAlarme(m))}</div>
            <button type="button" onClick={() => remover(m.id)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <BotoesNavegacaoMedicoes onBack={onBack} onNext={onNext} onAdicionar={() => onChange([...medicoes, novaMedicaoAlarme()])} labelAdicionar="Adicionar ponto de medição" />
    </div>
  );
}

function StepMedicoesIluminacao({
  medicoes,
  onChange,
  onBack,
  onNext,
}: {
  medicoes: MedicaoIluminacao[];
  onChange: (medicoes: MedicaoIluminacao[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function update(id: string, patch: Partial<MedicaoIluminacao>) {
    onChange(medicoes.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function remover(id: string) {
    onChange(medicoes.filter((m) => m.id !== id));
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-5">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Resultados das medições — Iluminação de Emergência (lux)</h4>
      <p className="text-xs text-gray-500">Aprovado automaticamente com mínimo de 3 lux em locais planos e 5 lux em locais com desnível (ABNT NBR 10898 / IN 11).</p>
      <div className="space-y-3">
        {medicoes.map((m, i) => (
          <div key={m.id} className="rounded-xl bg-black/20 border border-white/[0.08] p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <label className={labelClass}>Pavimento {i + 1}</label>
              <input className={inputClass} value={m.pavimento} onChange={(e) => update(m.id, { pavimento: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Local plano (lux) — mín. 3</label>
              <input className={inputClass} value={m.medicaoPlanoLux} onChange={(e) => update(m.id, { medicaoPlanoLux: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Com desnível (lux) — mín. 5</label>
              <input className={inputClass} value={m.medicaoDesnivelLux} onChange={(e) => update(m.id, { medicaoDesnivelLux: e.target.value })} />
            </div>
            <div className="pb-2">{badgeResultado(resultadoIluminacao(m))}</div>
            <button type="button" onClick={() => remover(m.id)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <BotoesNavegacaoMedicoes onBack={onBack} onNext={onNext} onAdicionar={() => onChange([...medicoes, novaMedicaoIluminacao()])} labelAdicionar="Adicionar pavimento" />
    </div>
  );
}

function StepMedicoesGas({
  state,
  onChange,
  onBack,
  onNext,
}: {
  state: LaudoTecnicoWizardState;
  onChange: (partial: Partial<LaudoTecnicoWizardState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const medicoes = state.medicoesGas ?? [];

  function update(id: string, patch: Partial<MedicaoGas>) {
    onChange({ medicoesGas: medicoes.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  }
  function remover(id: string) {
    onChange({ medicoesGas: medicoes.filter((m) => m.id !== id) });
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-5">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Condições do teste de estanqueidade</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className={labelClass}>Pressão inicial (Kgf/cm²)</label>
            <input className={inputClass} value={state.gasPressaoInicialKgf ?? ""} onChange={(e) => onChange({ gasPressaoInicialKgf: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Pressão final (Kgf/cm²)</label>
            <input className={inputClass} value={state.gasPressaoFinalKgf ?? ""} onChange={(e) => onChange({ gasPressaoFinalKgf: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className={labelClass}>Horário de início</label>
            <input type="time" className={inputClass} value={state.gasHorarioInicio ?? ""} onChange={(e) => onChange({ gasHorarioInicio: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Horário de término</label>
            <input type="time" className={inputClass} value={state.gasHorarioTermino ?? ""} onChange={(e) => onChange({ gasHorarioTermino: e.target.value })} />
          </div>
        </div>
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Redes testadas</h4>
      <div className="space-y-3">
        {medicoes.map((m, i) => (
          <div key={m.id} className="rounded-xl bg-black/20 border border-white/[0.08] p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <label className={labelClass}>Rede testada {i + 1}</label>
              <input className={inputClass} value={m.redeTestada} onChange={(e) => update(m.id, { redeTestada: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Estanque?</label>
              <select className={inputClass} value={m.estanque} onChange={(e) => update(m.id, { estanque: e.target.value as MedicaoGas["estanque"] })}>
                <option value="" className="bg-[#111625]">-- Selecione --</option>
                <option value="sim" className="bg-[#111625]">Sim</option>
                <option value="nao" className="bg-[#111625]">Não</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Data</label>
              <input type="date" className={inputClass} value={m.data} onChange={(e) => update(m.id, { data: e.target.value })} />
            </div>
            <div className="pb-2">{badgeResultado(resultadoGas(m))}</div>
            <button type="button" onClick={() => remover(m.id)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <BotoesNavegacaoMedicoes onBack={onBack} onNext={onNext} onAdicionar={() => onChange({ medicoesGas: [...medicoes, novaMedicaoGas()] })} labelAdicionar="Adicionar rede testada" />
    </div>
  );
}
