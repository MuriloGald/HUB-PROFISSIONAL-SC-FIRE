"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileDown, Loader2, PartyPopper } from "lucide-react";
import { ClientePicker } from "@/components/features/clientes/cliente-picker";
import { ProfissionalCampoSelect } from "@/components/features/profissionais/profissional-campo-select";
import { salvarAlarmeIn12 } from "@/app/actions/in12";
import { mensagemErroGeracao } from "@/lib/shared/errors";
import { REQUISITOS_IN12, TEXTO_ATESTADO_PADRAO } from "@/lib/in12/constants";
import type { Cliente, Profissional } from "@/lib/supabase/types";
import type { AlarmeIn12State, RespostaCNA } from "@/lib/in12/types";

const DRAFT_KEY = "scfire_in12_alarme_wizard_draft";
const STEPS = [
  { label: "Cliente" },
  { label: "Identificação" },
  { label: "Checklist NBR 17240" },
  { label: "Avaliação & Assinaturas" },
  { label: "Revisão & Emissão" },
];

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface AlarmeWizardProps {
  clientes: Cliente[];
  profissionais: Profissional[];
  clienteIdInicial?: string;
  initialState?: AlarmeIn12State;
}

export function AlarmeWizard({ clientes, profissionais, clienteIdInicial, initialState }: AlarmeWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<AlarmeIn12State>(
    () => initialState ?? { step: clienteIdInicial ? 1 : 0, respostas: {}, texto_atestado: TEXTO_ATESTADO_PADRAO }
  );
  const [hydrated, setHydrated] = useState(Boolean(initialState));
  const [salvo, setSalvo] = useState<AlarmeIn12State | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [baixandoModo, setBaixandoModo] = useState<"scfire" | "cbmsc" | null>(null);
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
        const snapshot = {
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
        };

        const respostasIniciais: Record<string, { resposta: RespostaCNA }> = {};
        REQUISITOS_IN12.forEach((r) => {
          respostasIniciais[r.item] = { resposta: r.padraoResposta || "C" };
        });

        setState({
          step: 1,
          respostas: respostasIniciais,
          cliente_id: cliente.id,
          cliente: snapshot,
          edificacao: cliente.razao_social ?? cliente.nome,
          logradouro: cliente.logradouro ?? undefined,
          numero: cliente.numero ?? undefined,
          complemento: cliente.complemento ?? undefined,
          bairro: cliente.bairro ?? undefined,
          municipio_uf: cliente.cidade ? `${cliente.cidade} - ${cliente.estado || "SC"}` : undefined,
          cidade: cliente.cidade ?? undefined,
          cep: cliente.cep ?? undefined,
          proprietario_nome: cliente.razao_social ?? cliente.nome,
          proprietario_email: cliente.email ?? undefined,
          proprietario_fone: cliente.telefone ?? undefined,
          texto_atestado: TEXTO_ATESTADO_PADRAO,
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

  function avancarPara(step: number, partial: Partial<AlarmeIn12State> = {}) {
    setState((s) => ({ ...s, ...partial, step }));
    window.scrollTo(0, 0);
  }

  function clearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function handleCancelar() {
    if (confirm("Tem certeza? Todos os dados não salvos deste relatório serão perdidos.")) {
      clearDraft();
      router.push("/documentos/in12");
    }
  }

  function setRespostaItem(itemKey: string, resposta: RespostaCNA, observacao?: string) {
    setState((s) => ({
      ...s,
      respostas: {
        ...s.respostas,
        [itemKey]: {
          resposta,
          observacao: observacao !== undefined ? observacao : s.respostas?.[itemKey]?.observacao || "",
        },
      },
    }));
  }

  function marcarTodosConforme() {
    const novasRespostas: Record<string, { resposta: RespostaCNA; observacao?: string }> = {};
    REQUISITOS_IN12.forEach((r) => {
      novasRespostas[r.item] = {
        resposta: "C",
        observacao: state.respostas?.[r.item]?.observacao || "",
      };
    });
    setState((s) => ({ ...s, respostas: novasRespostas }));
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const result = await salvarAlarmeIn12(state);
      if ("error" in result) {
        setErro(result.error ?? "Erro ao salvar o relatório.");
        return;
      }
      setSalvo(result.data.dados as AlarmeIn12State);
    } catch (err) {
      console.error("Erro ao salvar o relatório:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao salvar o relatório. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  async function handleBaixar(modo: "scfire" | "cbmsc") {
    if (!salvo) return;
    setBaixandoModo(modo);
    setErro(null);
    try {
      const { gerarPdfAlarmeIn12 } = await import("@/lib/in12/pdf-generator");
      await gerarPdfAlarmeIn12(salvo, modo);
    } catch (err) {
      console.error("Erro ao gerar o PDF:", err);
      setErro(mensagemErroGeracao(err, "Ocorreu um erro ao gerar o PDF. Tente novamente."));
    } finally {
      setBaixandoModo(null);
    }
  }

  function handleConcluir() {
    clearDraft();
    router.push("/documentos/in12/lista");
    router.refresh();
  }

  const step = state.step ?? 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header do Wizard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Comissionamento de Alarme de Incêndio (IN 12 / NBR 17240)
          </h1>
          <p className="text-sm text-gray-400">
            {state.codigo ? `Editando laudo ${state.codigo}` : "Preenchimento do relatório e vistoria técnica do sistema de detecção"}
          </p>
        </div>
        <button
          onClick={handleCancelar}
          className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all"
        >
          Cancelar
        </button>
      </div>

      {/* Indicador de Passos */}
      <div className="grid grid-cols-5 gap-2">
        {STEPS.map((s, i) => {
          const ativo = i === step;
          const concluido = i < step;
          return (
            <div
              key={s.label}
              className={`p-3 rounded-xl border text-center transition-all ${
                ativo
                  ? "bg-red-500/10 border-red-500/40 text-red-400 font-bold"
                  : concluido
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-white/[0.02] border-white/[0.06] text-gray-500"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider mb-0.5">Passo {i + 1}</div>
              <div className="text-xs truncate">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Conteúdo do Passo */}
      {step === 0 && (
        <ClientePicker
          clientes={clientes}
          clienteIdInicial={state.cliente_id}
          redirectToNovoCliente="/documentos/in12/novo"
          titulo="Selecione o Cliente para o Comissionamento de Alarme"
          onNext={(clienteId, clienteSnapshot) => {
            const respostasIniciais: Record<string, { resposta: RespostaCNA }> = { ...state.respostas };
            REQUISITOS_IN12.forEach((r) => {
              if (!respostasIniciais[r.item]) {
                respostasIniciais[r.item] = { resposta: r.padraoResposta || "C" };
              }
            });

            avancarPara(1, {
              cliente_id: clienteId,
              cliente: clienteSnapshot,
              respostas: respostasIniciais,
              edificacao: state.edificacao || clienteSnapshot.razao_social,
              logradouro: state.logradouro || clienteSnapshot.logradouro,
              numero: state.numero || clienteSnapshot.numero,
              complemento: state.complemento || clienteSnapshot.complemento,
              bairro: state.bairro || clienteSnapshot.bairro,
              municipio_uf: state.municipio_uf || (clienteSnapshot.cidade ? `${clienteSnapshot.cidade} - ${clienteSnapshot.estado || "SC"}` : ""),
              cidade: state.cidade || clienteSnapshot.cidade,
              cep: state.cep || clienteSnapshot.cep,
              proprietario_nome: state.proprietario_nome || clienteSnapshot.razao_social,
              proprietario_email: state.proprietario_email || clienteSnapshot.email,
              proprietario_fone: state.proprietario_fone || clienteSnapshot.telefone,
            });
          }}
        />
      )}

      {step === 1 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/[0.08] pb-3">
            Dados da Edificação & Responsáveis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className={labelClass}>Nome da Edificação / Imóvel</label>
              <input
                className={inputClass}
                value={state.edificacao || ""}
                onChange={(e) => setState((s) => ({ ...s, edificacao: e.target.value }))}
                placeholder="Ex: Condomínio Residencial Bella Vista"
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Logradouro Público / Endereço</label>
              <input
                className={inputClass}
                value={state.logradouro || ""}
                onChange={(e) => setState((s) => ({ ...s, logradouro: e.target.value }))}
                placeholder="Ex: Rua das Flores"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Número</label>
                <input
                  className={inputClass}
                  value={state.numero || ""}
                  onChange={(e) => setState((s) => ({ ...s, numero: e.target.value }))}
                  placeholder="Ex: 150"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Complemento</label>
                <input
                  className={inputClass}
                  value={state.complemento || ""}
                  onChange={(e) => setState((s) => ({ ...s, complemento: e.target.value }))}
                  placeholder="Ex: Bloco A"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Bairro</label>
              <input
                className={inputClass}
                value={state.bairro || ""}
                onChange={(e) => setState((s) => ({ ...s, bairro: e.target.value }))}
                placeholder="Ex: Centro"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Município / UF</label>
                <input
                  className={inputClass}
                  value={state.municipio_uf || ""}
                  onChange={(e) => setState((s) => ({ ...s, municipio_uf: e.target.value }))}
                  placeholder="Ex: Florianópolis - SC"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>CEP</label>
                <input
                  className={inputClass}
                  value={state.cep || ""}
                  onChange={(e) => setState((s) => ({ ...s, cep: e.target.value }))}
                  placeholder="Ex: 88000-000"
                />
              </div>
            </div>
          </div>

          <h4 className="text-sm font-bold text-red-400 pt-4 border-t border-white/[0.08]">
            Proprietário & Responsável pelo Uso
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Proprietário (Nome)</label>
              <input
                className={inputClass}
                value={state.proprietario_nome || ""}
                onChange={(e) => setState((s) => ({ ...s, proprietario_nome: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>E-mail do Proprietário</label>
              <input
                className={inputClass}
                value={state.proprietario_email || ""}
                onChange={(e) => setState((s) => ({ ...s, proprietario_email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Fone do Proprietário</label>
              <input
                className={inputClass}
                value={state.proprietario_fone || ""}
                onChange={(e) => setState((s) => ({ ...s, proprietario_fone: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Responsável pelo Uso (Nome)</label>
              <input
                className={inputClass}
                value={state.responsavel_uso_nome || ""}
                onChange={(e) => setState((s) => ({ ...s, responsavel_uso_nome: e.target.value }))}
                placeholder="Ex: Síndico / Gerente"
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>E-mail do Responsável pelo Uso</label>
              <input
                className={inputClass}
                value={state.responsavel_uso_email || ""}
                onChange={(e) => setState((s) => ({ ...s, responsavel_uso_email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Fone do Responsável pelo Uso</label>
              <input
                className={inputClass}
                value={state.responsavel_uso_fone || ""}
                onChange={(e) => setState((s) => ({ ...s, responsavel_uso_fone: e.target.value }))}
              />
            </div>
          </div>

          <h4 className="text-sm font-bold text-red-400 pt-4 border-t border-white/[0.08]">
            Especificações & Responsável Técnico
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfissionalCampoSelect
              profissionais={profissionais}
              value={state.rt_id}
              redirectToNovoProfissional="/documentos/in12/novo"
              onChange={(rtId, rtSnapshot) => setState((s) => ({ ...s, rt_id: rtId, rt: rtSnapshot }))}
            />

            <div className="space-y-1.5">
              <label className={labelClass}>Título Profissional do RT</label>
              <input
                className={inputClass}
                value={state.responsavel_tecnico_titulo || ""}
                onChange={(e) => setState((s) => ({ ...s, responsavel_tecnico_titulo: e.target.value }))}
                placeholder="Ex: Engenheiro de Segurança do Trabalho"
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Nº ART / RRT / TRT</label>
              <input
                className={inputClass}
                value={state.comprovante_rt_numero || ""}
                onChange={(e) => setState((s) => ({ ...s, comprovante_rt_numero: e.target.value }))}
                placeholder="Ex: ART 12345678-0"
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Ocupação - Destinação</label>
              <input
                className={inputClass}
                value={state.ocupacao_destinacao || ""}
                onChange={(e) => setState((s) => ({ ...s, ocupacao_destinacao: e.target.value }))}
                placeholder="Ex: Residencial Multifamiliar / Comercial"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Classificação de Uso</label>
                <input
                  className={inputClass}
                  value={state.classificacao_uso || ""}
                  onChange={(e) => setState((s) => ({ ...s, classificacao_uso: e.target.value }))}
                  placeholder="Ex: A-2"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Altura da Edificação</label>
                <input
                  className={inputClass}
                  value={state.altura_edificacao || ""}
                  onChange={(e) => setState((s) => ({ ...s, altura_edificacao: e.target.value }))}
                  placeholder="Ex: 24 metros"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Idade do Imóvel</label>
                <input
                  className={inputClass}
                  value={state.idade_imovel || ""}
                  onChange={(e) => setState((s) => ({ ...s, idade_imovel: e.target.value }))}
                  placeholder="Ex: 5 anos"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Pessoa de Contato & Fone</label>
                <input
                  className={inputClass}
                  value={state.contato_nome || ""}
                  onChange={(e) => setState((s) => ({ ...s, contato_nome: e.target.value }))}
                  placeholder="Ex: João (Zelador)"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/[0.08]">
            <button
              onClick={() => avancarPara(0)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={() => avancarPara(2)}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/20"
            >
              Avançar para Checklist <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                Requisitos NBR 17240 / IN 12 (Comissionamento de Alarme)
              </h3>
              <p className="text-xs text-gray-400">
                Selecione C (Conforme), NA (Não Aplicável) ou NC (Não Conforme) para cada ensaio.
              </p>
            </div>
            <button
              onClick={marcarTodosConforme}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Marcar todos como Conforme (C)
            </button>
          </div>

          <div className="space-y-4">
            {REQUISITOS_IN12.map((req) => {
              const itemResp = state.respostas?.[req.item] || { resposta: req.padraoResposta || "C" };
              const respAtual = itemResp.resposta;

              return (
                <div
                  key={req.item}
                  className="p-4 rounded-xl bg-black/20 border border-white/[0.06] space-y-3 hover:border-white/[0.12] transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-red-500/20 text-red-400 rounded-md border border-red-500/30">
                          Item {req.item}
                        </span>
                        <span className="text-sm font-bold text-white">{req.titulo}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{req.descricao}</p>
                    </div>

                    {/* Botões C / NA / NC */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(["C", "NA", "NC"] as const).map((opcao) => {
                        const selecionado = respAtual === opcao;
                        let corStyle = "bg-white/[0.04] text-gray-400 border-white/[0.08]";
                        if (selecionado) {
                          if (opcao === "C") corStyle = "bg-emerald-500 text-white font-bold border-emerald-400 shadow-lg shadow-emerald-500/30";
                          if (opcao === "NA") corStyle = "bg-amber-500 text-white font-bold border-amber-400 shadow-lg shadow-amber-500/30";
                          if (opcao === "NC") corStyle = "bg-red-600 text-white font-bold border-red-500 shadow-lg shadow-red-600/30";
                        }

                        return (
                          <button
                            key={opcao}
                            type="button"
                            onClick={() => setRespostaItem(req.item, opcao)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${corStyle}`}
                          >
                            {opcao === "C" ? "C (Conforme)" : opcao === "NA" ? "NA (N/A)" : "NC (Não Conf.)"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <input
                    className="w-full px-3 py-1.5 text-xs text-white bg-black/40 border border-white/[0.06] rounded-lg focus:outline-none focus:border-red-500/50"
                    placeholder="Observações complementares deste item (opcional)..."
                    value={itemResp.observacao || ""}
                    onChange={(e) => setRespostaItem(req.item, respAtual, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-white/[0.08]">
            <button
              onClick={() => avancarPara(1)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={() => avancarPara(3)}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/20"
            >
              Avançar para Avaliação <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/[0.08] pb-3">
            Avaliação Geral & Assinatura
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Observações Gerais da Vistoria (Obs.)</label>
              <textarea
                rows={3}
                className={inputClass}
                value={state.observacoes_gerais || ""}
                onChange={(e) => setState((s) => ({ ...s, observacoes_gerais: e.target.value }))}
                placeholder="Observações adicionais sobre o estado dos equipamentos, testes adicionais ou recomendações..."
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Texto do Atestado de Funcionamento (IN 12 / NBR 17240)</label>
              <textarea
                rows={4}
                className={inputClass}
                value={state.texto_atestado || TEXTO_ATESTADO_PADRAO}
                onChange={(e) => setState((s) => ({ ...s, texto_atestado: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Data da Inspeção / Comissionamento</label>
                <input
                  type="date"
                  className={inputClass}
                  value={state.data_inspecao || ""}
                  onChange={(e) => setState((s) => ({ ...s, data_inspecao: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/[0.08]">
            <button
              onClick={() => avancarPara(2)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={() => avancarPara(4)}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/20"
            >
              Avançar para Revisão <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-white/[0.08] pb-3">
              Revisão dos Dados & Finalização
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
              <div className="p-4 rounded-xl bg-black/20 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase">Edificação</span>
                <p className="font-bold text-white">{state.edificacao || "Não informada"}</p>
                <p>{[state.logradouro, state.numero, state.complemento, state.bairro].filter(Boolean).join(", ")}</p>
                <p>{state.municipio_uf}</p>
              </div>

              <div className="p-4 rounded-xl bg-black/20 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase">Responsáveis</span>
                <p><span className="text-gray-400">Proprietário:</span> {state.proprietario_nome || "N/I"}</p>
                <p><span className="text-gray-400">Responsável Uso:</span> {state.responsavel_uso_nome || "N/I"}</p>
                <p><span className="text-gray-400">RT:</span> {state.rt?.nome || state.rt_nome || "N/I"}</p>
              </div>
            </div>

            {erro && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {erro}
              </div>
            )}

            {!salvo ? (
              <div className="flex justify-between items-center pt-4 border-t border-white/[0.08]">
                <button
                  onClick={() => avancarPara(3)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Salvar Relatório no Hub
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <PartyPopper className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Relatório Salvo com Sucesso!</h4>
                  <p className="text-xs text-emerald-400/80 mt-1">
                    Código do documento: <strong className="text-white">{salvo.codigo}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleBaixar("scfire")}
                    disabled={baixandoModo !== null}
                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                  >
                    {baixandoModo === "scfire" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    Baixar PDF (Identidade SC Fire)
                  </button>

                  <button
                    onClick={() => handleBaixar("cbmsc")}
                    disabled={baixandoModo !== null}
                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-gray-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {baixandoModo === "cbmsc" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    Baixar PDF (Oficial CBMSC)
                  </button>
                </div>

                <div className="pt-4 border-t border-emerald-500/20">
                  <button
                    onClick={handleConcluir}
                    className="px-6 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Ir para Lista de Comissionamentos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
