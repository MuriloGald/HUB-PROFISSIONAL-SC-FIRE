"use client";

import { useMemo, useState, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Search, Plus, X, User, Pencil, Save, Building2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  criarEstagioProcesso,
  criarProcessoSave23,
  excluirEstagioProcesso,
  excluirProcessoSave23,
  moverProcessoSave23,
  renomearEstagioProcesso,
  trocarOrdemEstagios,
  atualizarProcessoSave23,
} from "@/app/actions/save23-processos";
import type { EstagioProcesso, ProcessoSave23 } from "@/lib/save23-processos/types";
import type { Cliente } from "@/lib/supabase/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

function nomeCliente(cliente: Cliente | undefined): string {
  if (!cliente) return "Cliente removido";
  return cliente.razao_social || cliente.nome;
}

interface ProcessosKanbanProps {
  estagiosIniciais: EstagioProcesso[];
  processosIniciais: ProcessoSave23[];
  clientes: Cliente[];
}

export function ProcessosKanban({ estagiosIniciais, processosIniciais, clientes }: ProcessosKanbanProps) {
  const [estagios, setEstagios] = useState<EstagioProcesso[]>(estagiosIniciais);
  const [processos, setProcessos] = useState<ProcessoSave23[]>(processosIniciais);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  const clientesPorId = useMemo(() => new Map(clientes.map((c) => [c.id, c])), [clientes]);

  const [colunaEditando, setColunaEditando] = useState<string | null>(null);
  const [nomeColunaEdit, setNomeColunaEdit] = useState("");
  const [novaColunaAberta, setNovaColunaAberta] = useState(false);
  const [nomeNovaColuna, setNomeNovaColuna] = useState("");

  const [selecionado, setSelecionado] = useState<ProcessoSave23 | null>(null);
  const [editResponsavel, setEditResponsavel] = useState("");
  const [editObservacoes, setEditObservacoes] = useState("");
  const [editando, setEditando] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [novoClienteId, setNovoClienteId] = useState("");
  const [novoResponsavel, setNovoResponsavel] = useState("");
  const [novoObservacoes, setNovoObservacoes] = useState("");
  const [formErro, setFormErro] = useState<string | null>(null);

  const processosFiltrados = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (!termo) return processos;
    return processos.filter((p) => {
      const c = clientesPorId.get(p.cliente_id);
      return nomeCliente(c).toLowerCase().includes(termo) || (p.responsavel ?? "").toLowerCase().includes(termo);
    });
  }, [processos, search, clientesPorId]);

  async function handleDragEnd(result: DropResult) {
    const { destination, draggableId, source } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const novoEstagioId = destination.droppableId;
    const anterior = processos;
    setProcessos((prev) => prev.map((p) => (p.id === draggableId ? { ...p, estagio_id: novoEstagioId } : p)));

    const res = await moverProcessoSave23(draggableId, novoEstagioId);
    if (res.error) {
      setProcessos(anterior);
      alert(res.error);
    }
  }

  function abrirCard(processo: ProcessoSave23) {
    setSelecionado(processo);
    setEditando(false);
  }

  function iniciarEdicaoCard() {
    if (!selecionado) return;
    setEditResponsavel(selecionado.responsavel ?? "");
    setEditObservacoes(selecionado.observacoes ?? "");
    setEditando(true);
  }

  function salvarCard() {
    if (!selecionado) return;
    startTransition(async () => {
      const res = await atualizarProcessoSave23(selecionado.id, { responsavel: editResponsavel, observacoes: editObservacoes });
      if (res.error) {
        alert(res.error);
        return;
      }
      const atualizado = { ...selecionado, responsavel: editResponsavel || null, observacoes: editObservacoes || null };
      setProcessos((prev) => prev.map((p) => (p.id === selecionado.id ? atualizado : p)));
      setSelecionado(atualizado);
      setEditando(false);
    });
  }

  function excluirCard(processo: ProcessoSave23) {
    if (!confirm(`Encerrar o acompanhamento de "${nomeCliente(clientesPorId.get(processo.cliente_id))}"?`)) return;
    startTransition(async () => {
      const res = await excluirProcessoSave23(processo.id);
      if (res.error) {
        alert(res.error);
        return;
      }
      setProcessos((prev) => prev.filter((p) => p.id !== processo.id));
      setSelecionado(null);
    });
  }

  function abrirModalNovoProcesso() {
    setNovoClienteId("");
    setNovoResponsavel("");
    setNovoObservacoes("");
    setFormErro(null);
    setModalAberto(true);
  }

  function criarNovoProcesso() {
    if (!novoClienteId) {
      setFormErro("Selecione um condomínio cadastrado.");
      return;
    }
    const primeiraColuna = [...estagios].sort((a, b) => a.ordem - b.ordem)[0];
    if (!primeiraColuna) {
      setFormErro("Crie ao menos uma coluna antes de iniciar um acompanhamento.");
      return;
    }

    setFormErro(null);
    startTransition(async () => {
      const res = await criarProcessoSave23({
        clienteId: novoClienteId,
        estagioId: primeiraColuna.id,
        responsavel: novoResponsavel,
        observacoes: novoObservacoes,
      });
      if (res.error) {
        setFormErro(res.error);
        return;
      }
      setProcessos((prev) => [res.data!, ...prev]);
      setModalAberto(false);
    });
  }

  function iniciarEdicaoColuna(estagio: EstagioProcesso) {
    setColunaEditando(estagio.id);
    setNomeColunaEdit(estagio.nome);
  }

  function salvarNomeColuna(id: string) {
    const nome = nomeColunaEdit.trim();
    if (!nome) {
      setColunaEditando(null);
      return;
    }
    setEstagios((prev) => prev.map((e) => (e.id === id ? { ...e, nome } : e)));
    setColunaEditando(null);
    startTransition(async () => {
      const res = await renomearEstagioProcesso(id, nome);
      if (res.error) alert(res.error);
    });
  }

  function moverColuna(estagio: EstagioProcesso, direcao: -1 | 1) {
    const ordenadas = [...estagios].sort((a, b) => a.ordem - b.ordem);
    const idx = ordenadas.findIndex((e) => e.id === estagio.id);
    const vizinho = ordenadas[idx + direcao];
    if (!vizinho) return;

    setEstagios((prev) => prev.map((e) => (e.id === estagio.id ? { ...e, ordem: vizinho.ordem } : e.id === vizinho.id ? { ...e, ordem: estagio.ordem } : e)));
    startTransition(async () => {
      const res = await trocarOrdemEstagios(estagio.id, estagio.ordem, vizinho.id, vizinho.ordem);
      if (res.error) alert(res.error);
    });
  }

  function criarNovaColuna() {
    const nome = nomeNovaColuna.trim();
    if (!nome) return;
    setNovaColunaAberta(false);
    setNomeNovaColuna("");
    startTransition(async () => {
      const res = await criarEstagioProcesso(nome);
      if (res.error) {
        alert(res.error);
        return;
      }
      setEstagios((prev) => [...prev, res.data!]);
    });
  }

  function excluirColuna(estagio: EstagioProcesso) {
    if (!confirm(`Excluir a coluna "${estagio.nome}"?`)) return;
    startTransition(async () => {
      const res = await excluirEstagioProcesso(estagio.id);
      if (res.error) {
        alert(res.error);
        return;
      }
      setEstagios((prev) => prev.filter((e) => e.id !== estagio.id));
    });
  }

  const estagiosOrdenados = [...estagios].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar condomínio, responsável..." className={`${inputClass} pl-9`} />
        </div>
        <button
          onClick={abrirModalNovoProcesso}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-500/10 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Acompanhamento
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-3 overflow-x-auto pb-4">
          {estagiosOrdenados.map((estagio, colIdx) => {
            const processosDaColuna = processosFiltrados.filter((p) => p.estagio_id === estagio.id);
            return (
              <Droppable droppableId={estagio.id} key={estagio.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`w-72 flex-shrink-0 flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] ${
                      snapshot.isDraggingOver ? "ring-2 ring-red-500/40" : ""
                    }`}
                  >
                    <div className="px-3 py-2.5 flex items-center justify-between gap-1 border-b border-white/[0.06] group">
                      <button
                        onClick={() => moverColuna(estagio, -1)}
                        disabled={colIdx === 0}
                        className="text-gray-600 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex-shrink-0"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      {colunaEditando === estagio.id ? (
                        <input
                          autoFocus
                          value={nomeColunaEdit}
                          onChange={(e) => setNomeColunaEdit(e.target.value)}
                          onBlur={() => salvarNomeColuna(estagio.id)}
                          onKeyDown={(e) => e.key === "Enter" && salvarNomeColuna(estagio.id)}
                          className="flex-1 min-w-0 px-1.5 py-0.5 text-xs font-bold text-white bg-black/30 border border-red-500/50 rounded outline-none"
                        />
                      ) : (
                        <span
                          onClick={() => iniciarEdicaoColuna(estagio)}
                          title="Clique para renomear"
                          className="flex-1 min-w-0 truncate text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
                        >
                          {estagio.nome}
                        </span>
                      )}

                      <span className="text-[10px] font-bold text-gray-400 bg-white/[0.06] px-2 py-0.5 rounded-full flex-shrink-0">{processosDaColuna.length}</span>

                      <button
                        onClick={() => moverColuna(estagio, 1)}
                        disabled={colIdx === estagiosOrdenados.length - 1}
                        className="text-gray-600 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex-shrink-0"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => excluirColuna(estagio)}
                        title="Excluir coluna"
                        className="text-gray-600 hover:text-red-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[120px]">
                      {processosDaColuna.map((processo, idx) => {
                        const cliente = clientesPorId.get(processo.cliente_id);
                        return (
                          <Draggable draggableId={processo.id} index={idx} key={processo.id}>
                            {(providedDrag, snapshotDrag) => (
                              <div
                                ref={providedDrag.innerRef}
                                {...providedDrag.draggableProps}
                                {...providedDrag.dragHandleProps}
                                onClick={() => abrirCard(processo)}
                                className={`p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] cursor-pointer hover:bg-white/[0.06] transition-colors ${
                                  snapshotDrag.isDragging ? "shadow-2xl ring-1 ring-red-500/40" : ""
                                }`}
                              >
                                <h4 className="text-xs font-bold text-white leading-snug mb-1.5 flex items-center gap-1.5">
                                  <Building2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0" /> {nomeCliente(cliente)}
                                </h4>
                                {processo.responsavel && (
                                  <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                    <User className="w-3 h-3" /> {processo.responsavel}
                                  </p>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}

          <div className="w-64 flex-shrink-0">
            {novaColunaAberta ? (
              <div className="p-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                <input
                  autoFocus
                  value={nomeNovaColuna}
                  onChange={(e) => setNomeNovaColuna(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && criarNovaColuna()}
                  placeholder="Nome da coluna"
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <button onClick={criarNovaColuna} className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg">
                    Adicionar
                  </button>
                  <button
                    onClick={() => {
                      setNovaColunaAberta(false);
                      setNomeNovaColuna("");
                    }}
                    className="px-3 py-1.5 border border-white/[0.08] text-gray-400 text-xs font-semibold rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setNovaColunaAberta(true)}
                className="w-full h-full min-h-[64px] flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.12] text-gray-500 hover:text-white hover:border-white/[0.25] transition-all text-xs font-semibold"
              >
                <Plus className="w-4 h-4" /> Nova Coluna
              </button>
            )}
          </div>
        </div>
      </DragDropContext>

      {/* Drawer de detalhe do processo */}
      {selecionado && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-[#0c0d12] border-l border-white/[0.08] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-400" /> {nomeCliente(clientesPorId.get(selecionado.cliente_id))}
              </h3>
              <button onClick={() => setSelecionado(null)} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.06]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {estagiosOrdenados.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setProcessos((prev) => prev.map((p) => (p.id === selecionado.id ? { ...p, estagio_id: e.id } : p)));
                    setSelecionado((prev) => (prev ? { ...prev, estagio_id: e.id } : prev));
                    moverProcessoSave23(selecionado.id, e.id);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all ${
                    selecionado.estagio_id === e.id ? "bg-red-500/20 border-red-500/50 text-red-300" : "border-white/[0.08] text-gray-500 hover:bg-white/[0.04]"
                  }`}
                >
                  {e.nome}
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detalhes</h4>
                {!editando ? (
                  <button onClick={iniciarEdicaoCard} className="text-gray-500 hover:text-white">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button onClick={salvarCard} disabled={pending} className="text-emerald-400 hover:text-emerald-300">
                    <Save className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {editando ? (
                <div className="space-y-2">
                  <input className={inputClass} value={editResponsavel} onChange={(e) => setEditResponsavel(e.target.value)} placeholder="Responsável" />
                  <textarea className={inputClass} rows={4} value={editObservacoes} onChange={(e) => setEditObservacoes(e.target.value)} placeholder="Observações" />
                </div>
              ) : (
                <div className="space-y-1.5 text-sm text-gray-300">
                  {selecionado.responsavel && (
                    <p className="flex items-center gap-1.5 text-gray-400">
                      <User className="w-3.5 h-3.5" /> {selecionado.responsavel}
                    </p>
                  )}
                  {selecionado.observacoes && <p className="text-xs text-gray-500 pt-1 border-t border-white/[0.06] mt-2">{selecionado.observacoes}</p>}
                  {!selecionado.responsavel && !selecionado.observacoes && <p className="text-xs text-gray-600">Nenhum detalhe registrado.</p>}
                </div>
              )}
            </div>

            <button
              onClick={() => excluirCard(selecionado)}
              className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Encerrar acompanhamento
            </button>
          </div>
        </div>
      )}

      {/* Modal novo processo */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0c0d12] border border-white/[0.08] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Novo Acompanhamento</h3>
              <button onClick={() => setModalAberto(false)} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.06]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className={labelClass}>Condomínio</label>
              <select value={novoClienteId} onChange={(e) => setNovoClienteId(e.target.value)} className={inputClass}>
                <option value="" className="bg-[#111625]">
                  -- Selecione --
                </option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#111625]">
                    {c.razao_social || c.nome}
                  </option>
                ))}
              </select>
            </div>

            <input className={inputClass} value={novoResponsavel} onChange={(e) => setNovoResponsavel(e.target.value)} placeholder="Responsável técnico" />
            <textarea className={inputClass} rows={3} value={novoObservacoes} onChange={(e) => setNovoObservacoes(e.target.value)} placeholder="Observações" />

            {formErro && <p className="text-xs text-red-400">{formErro}</p>}

            <button
              onClick={criarNovoProcesso}
              disabled={pending}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
            >
              {pending ? "Criando..." : "Iniciar Acompanhamento"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
