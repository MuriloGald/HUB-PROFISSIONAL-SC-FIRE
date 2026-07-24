"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, FileDown, Loader2, PartyPopper } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { ImageUploader } from "@/components/features/shared/image-uploader";
import { salvarEventoPirotecnico } from "@/app/actions/in27";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import { formatarDataBR } from "@/lib/shared/date-format";
import type { Cliente } from "@/lib/supabase/types";
import type { EventoPirotecnicoState } from "@/lib/in27/types";

const DRAFT_KEY = "scfire_in27_evento_wizard_draft";
const STEPS = [{ label: "Evento/Promotor" }, { label: "Blaster/RT" }, { label: "Fogos/Croqui" }, { label: "Revisão" }];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface EventoWizardProps {
  clientes: Cliente[];
  clienteIdInicial?: string;
  initialState?: EventoPirotecnicoState;
}

export function EventoWizard({ clientes, clienteIdInicial, initialState }: EventoWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<EventoPirotecnicoState>(() => initialState ?? { step: clienteIdInicial ? 1 : 0 });
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<EventoPirotecnicoState | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [baixando, setBaixando] = useState<string | null>(null);
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
          promotor_nome: cliente.razao_social ?? cliente.nome,
          promotor_cpf_cnpj: cliente.cnpj_cpf ?? undefined,
          promotor_fone: cliente.telefone ?? undefined,
          promotor_email: cliente.email ?? undefined,
          promotor_logradouro: cliente.logradouro ?? undefined,
          promotor_numero: cliente.numero ?? undefined,
          promotor_complemento: cliente.complemento ?? undefined,
          promotor_bairro: cliente.bairro ?? undefined,
          promotor_cidade: cliente.cidade ?? undefined,
          promotor_cep: cliente.cep ?? undefined,
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

  function avancarPara(step: number, partial: Partial<EventoPirotecnicoState> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste evento serão perdidos.")) {
      clearDraft();
      router.push("/documentos/in27");
    }
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarEventoPirotecnico(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o evento.");
        return;
      }
      setSalvo(result.data.dados as EventoPirotecnicoState);
    } catch (err) {
      console.error("Erro ao salvar o evento:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao salvar o evento. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  async function handleBaixar(tipo: "a" | "b" | "c") {
    if (!salvo) return;
    setBaixando(tipo);
    setErro(null);
    try {
      const { gerarPdfRequerimento, gerarPdfPlanoSeguranca, gerarPdfCroqui } = await import("@/lib/in27/pdf-generator");
      if (tipo === "a") await gerarPdfRequerimento(salvo);
      else if (tipo === "b") await gerarPdfPlanoSeguranca(salvo);
      else await gerarPdfCroqui(salvo);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixando(null);
    }
  }

  function handleConcluir() {
    clearDraft();
    router.push("/documentos/in27/lista");
    router.refresh();
  }

  const step = state.step ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Evento Pirotécnico</h1>
          <p className="text-sm text-gray-400 mt-1">IN 27/CBMSC — Anexo A (Requerimento), B (Plano de Segurança) e C (Croqui).</p>
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
          redirectToNovoCliente="/documentos/in27/novo"
          titulo="Selecione o Promotor do Evento"
          onNext={(clienteId, cliente) =>
            avancarPara(1, {
              cliente_id: clienteId,
              cliente,
              promotor_nome: cliente.razao_social,
              promotor_cpf_cnpj: cliente.cnpj || cliente.cpf,
              promotor_fone: cliente.telefone,
              promotor_email: cliente.email,
              promotor_logradouro: cliente.logradouro,
              promotor_numero: cliente.numero,
              promotor_complemento: cliente.complemento,
              promotor_bairro: cliente.bairro,
              promotor_cidade: cliente.cidade,
              promotor_cep: cliente.cep,
            })
          }
        />
      )}

      {step === 1 && <StepEventoPromotor state={state} onBack={() => avancarPara(0)} onNext={(partial) => avancarPara(2, partial)} />}

      {step === 2 && <StepBlasterRt state={state} onBack={() => avancarPara(1)} onNext={(partial) => avancarPara(3, partial)} />}

      {step === 3 && <StepFogosCroqui state={state} onBack={() => avancarPara(2)} onNext={(partial) => avancarPara(4, partial)} />}

      {step === 4 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">{salvo ? "Evento Salvo!" : "Pronto para Salvar o Evento!"}</h3>
            <p className="text-sm text-gray-400">{salvo ? "Baixe os 3 PDFs abaixo." : "Revise os dados abaixo antes de salvar."}</p>
          </div>

          {erro && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

          <div className="rounded-xl bg-black/20 border border-white/[0.08] p-5 space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Promotor:</strong> {state.promotor_nome || "-"}</p>
            <p><strong className="text-white">Data do evento:</strong> {state.data_evento ? formatarDataBR(state.data_evento) : "-"}</p>
            <p><strong className="text-white">Blaster:</strong> {state.blaster_nome || "-"}</p>
          </div>

          {!salvo ? (
            <div className="flex justify-center gap-3 pt-2">
              <button type="button" onClick={() => avancarPara(3)} className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar e Editar
              </button>
              <button
                type="button"
                onClick={handleSalvar}
                disabled={salvando}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {salvando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Salvar Evento
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleBaixar("a")}
                  disabled={baixando !== null}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {baixando === "a" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  1. Anexo A — Requerimento
                </button>
                <button
                  type="button"
                  onClick={() => handleBaixar("b")}
                  disabled={baixando !== null}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {baixando === "b" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  2. Anexo B — Plano de Segurança
                </button>
                <button
                  type="button"
                  onClick={() => handleBaixar("c")}
                  disabled={baixando !== null}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {baixando === "c" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  3. Anexo C — Croqui
                </button>
              </div>
              <div className="flex justify-center">
                <button type="button" onClick={handleConcluir} className="px-4 py-2 border border-white/[0.08] hover:border-emerald-500/50 hover:bg-white/[0.04] text-white hover:text-emerald-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
                  <PartyPopper className="w-3.5 h-3.5" /> Concluir e Voltar para Consultar Eventos
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepEventoPromotor({
  state,
  onBack,
  onNext,
}: {
  state: EventoPirotecnicoState;
  onBack: () => void;
  onNext: (partial: Partial<EventoPirotecnicoState>) => void;
}) {
  const [tipoEvento, setTipoEvento] = useState(state.tipo_evento ?? "indoor");
  const [form, setForm] = useState({
    data_evento: state.data_evento ?? "",
    horario_inicio: state.horario_inicio ?? "",
    evento_logradouro: state.evento_logradouro ?? "",
    evento_numero: state.evento_numero ?? "",
    evento_complemento: state.evento_complemento ?? "",
    evento_bairro: state.evento_bairro ?? "",
    evento_cidade: state.evento_cidade ?? "",
    evento_cep: state.evento_cep ?? "",
    descricao_evento: state.descricao_evento ?? "",
    promotor_nome: state.promotor_nome ?? "",
    promotor_cpf_cnpj: state.promotor_cpf_cnpj ?? "",
    promotor_fone: state.promotor_fone ?? "",
    promotor_email: state.promotor_email ?? "",
    promotor_logradouro: state.promotor_logradouro ?? "",
    promotor_numero: state.promotor_numero ?? "",
    promotor_complemento: state.promotor_complemento ?? "",
    promotor_bairro: state.promotor_bairro ?? "",
    promotor_cidade: state.promotor_cidade ?? "",
    promotor_cep: state.promotor_cep ?? "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ ...form, tipo_evento: tipoEvento });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">1. Sobre o Evento</h4>
      <div className="flex items-center gap-3">
        <span className={labelClass}>Tipo</span>
        <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
          <button type="button" onClick={() => setTipoEvento("indoor")} className={`px-4 py-1.5 text-xs font-semibold transition-all ${tipoEvento === "indoor" ? "bg-red-500 text-white" : "text-gray-400 hover:bg-white/[0.04]"}`}>
            Indoor
          </button>
          <button type="button" onClick={() => setTipoEvento("outdoor")} className={`px-4 py-1.5 text-xs font-semibold transition-all ${tipoEvento === "outdoor" ? "bg-red-500 text-white" : "text-gray-400 hover:bg-white/[0.04]"}`}>
            Outdoor
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Data</label>
          <input type="date" className={inputClass} value={form.data_evento} onChange={(e) => update("data_evento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Horário de início</label>
          <input type="time" className={inputClass} value={form.horario_inicio} onChange={(e) => update("horario_inicio", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>Logradouro</label>
          <input className={inputClass} value={form.evento_logradouro} onChange={(e) => update("evento_logradouro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº</label>
          <input className={inputClass} value={form.evento_numero} onChange={(e) => update("evento_numero", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Complemento</label>
          <input className={inputClass} value={form.evento_complemento} onChange={(e) => update("evento_complemento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input className={inputClass} value={form.evento_bairro} onChange={(e) => update("evento_bairro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} value={form.evento_cidade} onChange={(e) => update("evento_cidade", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5 max-w-xs">
        <label className={labelClass}>CEP</label>
        <input className={inputClass} value={form.evento_cep} onChange={(e) => update("evento_cep", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Descrição do evento</label>
        <textarea rows={2} className={inputClass} value={form.descricao_evento} onChange={(e) => update("descricao_evento", e.target.value)} />
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">2. Sobre o Promotor do Evento</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome</label>
          <input className={inputClass} value={form.promotor_nome} onChange={(e) => update("promotor_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CPF ou CNPJ</label>
          <input className={inputClass} value={form.promotor_cpf_cnpj} onChange={(e) => update("promotor_cpf_cnpj", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Fone</label>
          <input className={inputClass} value={form.promotor_fone} onChange={(e) => update("promotor_fone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>E-mail</label>
          <input className={inputClass} value={form.promotor_email} onChange={(e) => update("promotor_email", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>Logradouro</label>
          <input className={inputClass} value={form.promotor_logradouro} onChange={(e) => update("promotor_logradouro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº</label>
          <input className={inputClass} value={form.promotor_numero} onChange={(e) => update("promotor_numero", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Complemento</label>
          <input className={inputClass} value={form.promotor_complemento} onChange={(e) => update("promotor_complemento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input className={inputClass} value={form.promotor_bairro} onChange={(e) => update("promotor_bairro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} value={form.promotor_cidade} onChange={(e) => update("promotor_cidade", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5 max-w-xs">
        <label className={labelClass}>CEP</label>
        <input className={inputClass} value={form.promotor_cep} onChange={(e) => update("promotor_cep", e.target.value)} />
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

function StepBlasterRt({
  state,
  onBack,
  onNext,
}: {
  state: EventoPirotecnicoState;
  onBack: () => void;
  onNext: (partial: Partial<EventoPirotecnicoState>) => void;
}) {
  const [rtEBlaster, setRtEBlaster] = useState(state.rt_e_blaster ?? false);
  const [form, setForm] = useState({
    blaster_nome: state.blaster_nome ?? "",
    blaster_registro_exercito: state.blaster_registro_exercito ?? "",
    blaster_fone: state.blaster_fone ?? "",
    blaster_email: state.blaster_email ?? "",
    blaster_logradouro: state.blaster_logradouro ?? "",
    blaster_numero: state.blaster_numero ?? "",
    blaster_complemento: state.blaster_complemento ?? "",
    blaster_bairro: state.blaster_bairro ?? "",
    blaster_cidade: state.blaster_cidade ?? "",
    blaster_cep: state.blaster_cep ?? "",
    rt_nome: state.rt_nome ?? "",
    rt_registro: state.rt_registro ?? "",
    rt_fone: state.rt_fone ?? "",
    rt_email: state.rt_email ?? "",
    rt_logradouro: state.rt_logradouro ?? "",
    rt_numero: state.rt_numero ?? "",
    rt_complemento: state.rt_complemento ?? "",
    rt_bairro: state.rt_bairro ?? "",
    rt_cidade: state.rt_cidade ?? "",
    rt_cep: state.rt_cep ?? "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ ...form, rt_e_blaster: rtEBlaster });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">3. Sobre o Blaster</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Nome</label>
          <input className={inputClass} value={form.blaster_nome} onChange={(e) => update("blaster_nome", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº do registro no exército</label>
          <input className={inputClass} value={form.blaster_registro_exercito} onChange={(e) => update("blaster_registro_exercito", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Fone</label>
          <input className={inputClass} value={form.blaster_fone} onChange={(e) => update("blaster_fone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>E-mail</label>
          <input className={inputClass} value={form.blaster_email} onChange={(e) => update("blaster_email", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>Logradouro</label>
          <input className={inputClass} value={form.blaster_logradouro} onChange={(e) => update("blaster_logradouro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nº</label>
          <input className={inputClass} value={form.blaster_numero} onChange={(e) => update("blaster_numero", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Complemento</label>
          <input className={inputClass} value={form.blaster_complemento} onChange={(e) => update("blaster_complemento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Bairro</label>
          <input className={inputClass} value={form.blaster_bairro} onChange={(e) => update("blaster_bairro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} value={form.blaster_cidade} onChange={(e) => update("blaster_cidade", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5 max-w-xs">
        <label className={labelClass}>CEP</label>
        <input className={inputClass} value={form.blaster_cep} onChange={(e) => update("blaster_cep", e.target.value)} />
      </div>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">4. Responsável Técnico pelo Espetáculo Pirotécnico</h4>
      <label className="flex items-center gap-2 text-sm text-red-400 font-medium cursor-pointer">
        <input type="checkbox" checked={rtEBlaster} onChange={(e) => setRtEBlaster(e.target.checked)} className="accent-red-500" />
        Se for o blaster, assinalar esta alternativa e não preencher novamente
      </label>
      {!rtEBlaster && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Nome</label>
              <input className={inputClass} value={form.rt_nome} onChange={(e) => update("rt_nome", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Nº do registro</label>
              <input className={inputClass} value={form.rt_registro} onChange={(e) => update("rt_registro", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Fone</label>
              <input className={inputClass} value={form.rt_fone} onChange={(e) => update("rt_fone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>E-mail</label>
              <input className={inputClass} value={form.rt_email} onChange={(e) => update("rt_email", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Logradouro</label>
              <input className={inputClass} value={form.rt_logradouro} onChange={(e) => update("rt_logradouro", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Nº</label>
              <input className={inputClass} value={form.rt_numero} onChange={(e) => update("rt_numero", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Complemento</label>
              <input className={inputClass} value={form.rt_complemento} onChange={(e) => update("rt_complemento", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Bairro</label>
              <input className={inputClass} value={form.rt_bairro} onChange={(e) => update("rt_bairro", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Cidade</label>
              <input className={inputClass} value={form.rt_cidade} onChange={(e) => update("rt_cidade", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5 max-w-xs">
            <label className={labelClass}>CEP</label>
            <input className={inputClass} value={form.rt_cep} onChange={(e) => update("rt_cep", e.target.value)} />
          </div>
        </>
      )}

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

function StepFogosCroqui({
  state,
  onBack,
  onNext,
}: {
  state: EventoPirotecnicoState;
  onBack: () => void;
  onNext: (partial: Partial<EventoPirotecnicoState>) => void;
}) {
  const [classesFogos, setClassesFogos] = useState(state.classes_fogos ?? "");
  const [anexoCarteira, setAnexoCarteira] = useState(state.anexo_carteira_blaster ?? false);
  const [anexoCroqui, setAnexoCroqui] = useState(state.anexo_croqui_projeto ?? false);
  const [croquiImagem, setCroquiImagem] = useState(state.croqui_imagem ? [state.croqui_imagem] : []);
  const [croquiObs, setCroquiObs] = useState(state.croqui_observacoes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({
      classes_fogos: classesFogos,
      anexo_carteira_blaster: anexoCarteira,
      anexo_croqui_projeto: anexoCroqui,
      croqui_imagem: croquiImagem[0],
      croqui_observacoes: croquiObs,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">5. Classes de Fogos de Artifício</h4>
      <textarea
        rows={5}
        placeholder="Descreva as classes e quantidades de fogos de artifício que serão utilizados"
        className={inputClass}
        value={classesFogos}
        onChange={(e) => setClassesFogos(e.target.value)}
      />

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">6. Anexos ao Plano de Segurança</h4>
      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
        <input type="checkbox" checked={anexoCarteira} onChange={(e) => setAnexoCarteira(e.target.checked)} className="accent-red-500" />
        Cópia da carteira do Técnico em Pirotecnia (Blaster), com registro no Estado de Santa Catarina
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
        <input type="checkbox" checked={anexoCroqui} onChange={(e) => setAnexoCroqui(e.target.checked)} className="accent-red-500" />
        Croqui local ou projeto de segurança
      </label>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Croqui (Anexo C)</h4>
      <ImageUploader imagens={croquiImagem} onChange={setCroquiImagem} multiplas={false} />
      <textarea
        rows={3}
        placeholder="Observações relevantes acerca do evento pirotécnico"
        className={inputClass}
        value={croquiObs}
        onChange={(e) => setCroquiObs(e.target.value)}
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
