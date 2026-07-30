"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Bell, Check, CheckCircle2, Droplets, FileDown, Lightbulb, Loader2, PartyPopper, Plus, Trash2, X } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { ImageUploader } from "@/components/features/shared/image-uploader";
import { salvarLaudoTecnico } from "@/app/actions/laudos-tecnicos";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import { LAUDOS_TECNICOS_CONFIG, LAUDOS_TECNICOS_LABELS } from "@/lib/laudos-tecnicos/constants";
import type { LaudoTecnicoConfig } from "@/lib/laudos-tecnicos/constants";
import { novaMedicaoAlarme, novaMedicaoIluminacao, novaMedicaoGas } from "@/lib/laudos-tecnicos/types";
import { resultadoAlarme, resultadoIluminacao, resultadoGas } from "@/lib/laudos-tecnicos/resultado";
import type { Cliente } from "@/lib/supabase/types";
import type { LaudoTecnicoTipo, LaudoTecnicoWizardState, MedicaoAlarme, MedicaoIluminacao, MedicaoGas, ResultadoMedicao } from "@/lib/laudos-tecnicos/types";

const DRAFT_KEY = "scfire_laudos_tecnicos_wizard_draft";
const STEPS = [{ label: "Tipo" }, { label: "Cliente" }, { label: "Identificação" }, { label: "Medições" }, { label: "Fotos" }, { label: "Revisão" }];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

const TIPO_ICON: Record<LaudoTecnicoTipo, typeof Bell> = { alarme: Bell, iluminacao: Lightbulb, gas: Droplets };

function badgeResultado(r: ResultadoMedicao) {
  if (r === "aprovado") return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">APROVADO</span>;
  if (r === "reprovado") return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">REPROVADO</span>;
  return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/[0.04] text-gray-500 border border-white/[0.08]">—</span>;
}

interface WizardProps {
  clientes: Cliente[];
  initialState?: LaudoTecnicoWizardState;
}

export function LaudoTecnicoWizard({ clientes, initialState }: WizardProps) {
  const router = useRouter();
  const [state, setState] = useState<LaudoTecnicoWizardState>(() => initialState ?? { step: 0 });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<LaudoTecnicoWizardState | null>(null);
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
      medicoesAlarme: tipo === "alarme" ? state.medicoesAlarme ?? [novaMedicaoAlarme()] : state.medicoesAlarme,
      medicoesIluminacao: tipo === "iluminacao" ? state.medicoesIluminacao ?? [novaMedicaoIluminacao()] : state.medicoesIluminacao,
      medicoesGas: tipo === "gas" ? state.medicoesGas ?? [novaMedicaoGas()] : state.medicoesGas,
    });
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
    state.tipo === "alarme"
      ? (state.medicoesAlarme ?? []).filter((m) => resultadoAlarme(m) === "reprovado").length
      : state.tipo === "iluminacao"
        ? (state.medicoesIluminacao ?? []).filter((m) => resultadoIluminacao(m) === "reprovado").length
        : (state.medicoesGas ?? []).filter((m) => resultadoGas(m) === "reprovado").length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Laudo Técnico</h1>
          <p className="text-sm text-gray-400 mt-1">Decorrente da Inspeção de Regularidade (IN 04) — Alarme, Iluminação de Emergência ou Rede de Gás.</p>
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
        <ClientePicker
          clientes={clientes}
          clienteIdInicial={state.cliente_id}
          redirectToNovoCliente="/documentos/laudos-tecnicos/novo"
          titulo="Selecione o Cliente"
          onNext={(clienteId, cliente) => avancarPara(2, { cliente_id: clienteId, cliente })}
        />
      )}

      {step === 2 && config && (
        <StepIdentificacao state={state} config={config} onBack={() => avancarPara(1)} onNext={(partial) => avancarPara(3, partial)} />
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
  onBack,
  onNext,
}: {
  state: LaudoTecnicoWizardState;
  config: LaudoTecnicoConfig;
  onBack: () => void;
  onNext: (partial: Partial<LaudoTecnicoWizardState>) => void;
}) {
  const [form, setForm] = useState({
    rt_selecionado: state.rt_selecionado ?? "rt1",
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Responsável Técnico (RT)</label>
          <select required value={form.rt_selecionado} onChange={(e) => update("rt_selecionado", e.target.value)} className={inputClass}>
            <option value="rt1" className="bg-[#111625]">Dione Borges</option>
            <option value="rt2" className="bg-[#111625]">Paulo Roberto Ramos</option>
          </select>
        </div>
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
