"use client";

import { useMemo, useState, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Search, Plus, X, Phone, Mail, DollarSign, Trash2, Pencil, Save, Building2, Send, Archive, ArchiveRestore } from "lucide-react";
import {
  arquivarLead,
  atualizarContatoLead,
  atualizarEstagioLead,
  criarInteracao,
  criarLead,
  desarquivarLead,
  excluirLead,
  listarInteracoes,
} from "@/app/actions/crm";
import { ESTAGIOS } from "@/lib/crm/types";
import type { Interaction, InteractionType, Lead, LeadStage } from "@/lib/crm/types";
import type { Cliente } from "@/lib/supabase/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

function formatarMoeda(v: number | null): string {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const INTERACAO_LABEL: Record<InteractionType, string> = {
  ligacao: "Ligação",
  email: "E-mail",
  reuniao: "Reunião",
  nota: "Nota",
  proposta: "Proposta",
  whatsapp: "WhatsApp",
};

interface CrmKanbanProps {
  leadsIniciais: Lead[];
  leadsArquivadosIniciais: Lead[];
  clientes: Cliente[];
}

export function CrmKanban({ leadsIniciais, leadsArquivadosIniciais, clientes }: CrmKanbanProps) {
  const [leads, setLeads] = useState<Lead[]>(leadsIniciais);
  const [leadsArquivados, setLeadsArquivados] = useState<Lead[]>(leadsArquivadosIniciais);
  const [aba, setAba] = useState<"ativo" | "arquivados">("ativo");
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [novaInteracaoTipo, setNovaInteracaoTipo] = useState<InteractionType>("nota");
  const [novaInteracaoTexto, setNovaInteracaoTexto] = useState("");

  const [editandoContato, setEditandoContato] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editContactName, setEditContactName] = useState("");
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editContactEmail, setEditContactEmail] = useState("");
  const [editExpectedValue, setEditExpectedValue] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [origemCliente, setOrigemCliente] = useState<"novo" | "existente">("novo");
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState("");
  const [novoCompanyName, setNovoCompanyName] = useState("");
  const [novoContactName, setNovoContactName] = useState("");
  const [novoContactPhone, setNovoContactPhone] = useState("");
  const [novoContactEmail, setNovoContactEmail] = useState("");
  const [novoExpectedValue, setNovoExpectedValue] = useState("");
  const [novoNotes, setNovoNotes] = useState("");
  const [formErro, setFormErro] = useState<string | null>(null);

  const leadsFiltrados = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (!termo) return leads;
    return leads.filter(
      (l) =>
        l.company_name.toLowerCase().includes(termo) ||
        (l.contact_name ?? "").toLowerCase().includes(termo) ||
        (l.notes ?? "").toLowerCase().includes(termo)
    );
  }, [leads, search]);

  async function handleDragEnd(result: DropResult) {
    const { destination, draggableId, source } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const novoEstagio = destination.droppableId as LeadStage;
    const anterior = leads;
    setLeads((prev) => prev.map((l) => (l.id === draggableId ? { ...l, stage: novoEstagio } : l)));

    const res = await atualizarEstagioLead(draggableId, novoEstagio);
    if (res.error) {
      setLeads(anterior);
      alert(res.error);
    }
  }

  function abrirLead(lead: Lead) {
    setSelectedLead(lead);
    setEditandoContato(false);
    setLoadingInteractions(true);
    listarInteracoes(lead.id).then((res) => {
      setInteractions(res.data);
      setLoadingInteractions(false);
    });
  }

  function iniciarEdicaoContato() {
    if (!selectedLead) return;
    setEditCompanyName(selectedLead.company_name);
    setEditContactName(selectedLead.contact_name ?? "");
    setEditContactPhone(selectedLead.contact_phone ?? "");
    setEditContactEmail(selectedLead.contact_email ?? "");
    setEditExpectedValue(selectedLead.expected_value != null ? String(selectedLead.expected_value) : "");
    setEditNotes(selectedLead.notes ?? "");
    setEditandoContato(true);
  }

  function salvarContato() {
    if (!selectedLead) return;
    startTransition(async () => {
      const res = await atualizarContatoLead(selectedLead.id, {
        companyName: editCompanyName,
        contactName: editContactName,
        contactPhone: editContactPhone,
        contactEmail: editContactEmail,
        expectedValue: editExpectedValue ? Number(editExpectedValue) : null,
        notes: editNotes,
      });
      if (res.error) {
        alert(res.error);
        return;
      }
      const atualizado = {
        ...selectedLead,
        company_name: editCompanyName,
        contact_name: editContactName || null,
        contact_phone: editContactPhone || null,
        contact_email: editContactEmail || null,
        expected_value: editExpectedValue ? Number(editExpectedValue) : null,
        notes: editNotes || null,
      };
      setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? atualizado : l)));
      setSelectedLead(atualizado);
      setEditandoContato(false);
    });
  }

  function excluir(lead: Lead) {
    if (!confirm(`Excluir a oportunidade "${lead.company_name}"?`)) return;
    startTransition(async () => {
      const res = await excluirLead(lead.id);
      if (res.error) {
        alert(res.error);
        return;
      }
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      setSelectedLead(null);
    });
  }

  function arquivar(lead: Lead) {
    startTransition(async () => {
      const res = await arquivarLead(lead.id);
      if (res.error) {
        alert(res.error);
        return;
      }
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      setLeadsArquivados((prev) => [{ ...lead, archived: true }, ...prev]);
      if (selectedLead?.id === lead.id) setSelectedLead(null);
    });
  }

  function desarquivar(lead: Lead) {
    startTransition(async () => {
      const res = await desarquivarLead(lead.id);
      if (res.error) {
        alert(res.error);
        return;
      }
      setLeadsArquivados((prev) => prev.filter((l) => l.id !== lead.id));
      setLeads((prev) => [{ ...lead, archived: false }, ...prev]);
    });
  }

  function adicionarInteracao() {
    if (!selectedLead || !novaInteracaoTexto.trim()) return;
    startTransition(async () => {
      const res = await criarInteracao(selectedLead.id, novaInteracaoTipo, novaInteracaoTexto);
      if (res.error) {
        alert(res.error);
        return;
      }
      setInteractions((prev) => [res.data!, ...prev]);
      setNovaInteracaoTexto("");
    });
  }

  function abrirModalNovaOportunidade() {
    setOrigemCliente("novo");
    setClienteSelecionadoId("");
    setNovoCompanyName("");
    setNovoContactName("");
    setNovoContactPhone("");
    setNovoContactEmail("");
    setNovoExpectedValue("");
    setNovoNotes("");
    setFormErro(null);
    setModalAberto(true);
  }

  function selecionarClienteExistente(id: string) {
    setClienteSelecionadoId(id);
    const c = clientes.find((cl) => cl.id === id);
    if (c) {
      setNovoContactName(c.responsavel_nome ?? "");
      setNovoContactPhone(c.telefone ?? "");
      setNovoContactEmail(c.email ?? "");
    }
  }

  function criarNovaOportunidade() {
    const companyName = origemCliente === "existente" ? clientes.find((c) => c.id === clienteSelecionadoId)?.razao_social || clientes.find((c) => c.id === clienteSelecionadoId)?.nome || "" : novoCompanyName;

    if (origemCliente === "existente" && !clienteSelecionadoId) {
      setFormErro("Selecione um cliente cadastrado.");
      return;
    }
    if (origemCliente === "novo" && !novoCompanyName.trim()) {
      setFormErro("Informe o nome da empresa.");
      return;
    }

    setFormErro(null);
    startTransition(async () => {
      const res = await criarLead({
        clienteId: origemCliente === "existente" ? clienteSelecionadoId : null,
        companyName,
        contactName: novoContactName,
        contactPhone: novoContactPhone,
        contactEmail: novoContactEmail,
        expectedValue: novoExpectedValue ? Number(novoExpectedValue) : null,
        notes: novoNotes,
      });
      if (res.error) {
        setFormErro(res.error);
        return;
      }
      setLeads((prev) => [res.data!, ...prev]);
      setModalAberto(false);
    });
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.08] flex-shrink-0">
            <button
              onClick={() => setAba("ativo")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${aba === "ativo" ? "bg-red-500/15 text-red-300" : "text-gray-500 hover:text-gray-300"}`}
            >
              Ativo
            </button>
            <button
              onClick={() => setAba("arquivados")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${aba === "arquivados" ? "bg-red-500/15 text-red-300" : "text-gray-500 hover:text-gray-300"}`}
            >
              Arquivados ({leadsArquivados.length})
            </button>
          </div>
          {aba === "ativo" && (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar empresa, contato..." className={`${inputClass} pl-9`} />
            </div>
          )}
        </div>
        {aba === "ativo" && (
          <button
            onClick={abrirModalNovaOportunidade}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-500/10 transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Oportunidade
          </button>
        )}
      </div>

      {aba === "arquivados" ? (
        <div className="flex-1 overflow-y-auto space-y-2">
          {leadsArquivados.length === 0 && <p className="text-sm text-gray-500">Nenhum negócio arquivado ainda.</p>}
          {leadsArquivados.map((lead) => (
            <div key={lead.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">{lead.company_name}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  {lead.contact_name && <span>{lead.contact_name}</span>}
                  {lead.expected_value != null && <span className="text-emerald-400 font-semibold">{formatarMoeda(lead.expected_value)}</span>}
                </div>
              </div>
              <button
                onClick={() => desarquivar(lead)}
                disabled={pending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.1] hover:bg-white/[0.04] text-gray-300 text-xs font-semibold rounded-md transition-colors flex-shrink-0"
              >
                <ArchiveRestore className="w-3.5 h-3.5" /> Desarquivar
              </button>
            </div>
          ))}
        </div>
      ) : (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-3 overflow-x-auto pb-4">
          {ESTAGIOS.map((estagio) => {
            const leadsDoEstagio = leadsFiltrados.filter((l) => l.stage === estagio.key);
            return (
              <Droppable droppableId={estagio.key} key={estagio.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`w-72 flex-shrink-0 flex flex-col rounded-2xl border ${estagio.color} ${snapshot.isDraggingOver ? "ring-2 ring-red-500/40" : ""}`}
                  >
                    <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{estagio.label}</span>
                      <span className="text-[10px] font-bold text-gray-400 bg-white/[0.06] px-2 py-0.5 rounded-full">{leadsDoEstagio.length}</span>
                    </div>
                    <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[120px]">
                      {leadsDoEstagio.map((lead, idx) => (
                        <Draggable draggableId={lead.id} index={idx} key={lead.id}>
                          {(providedDrag, snapshotDrag) => (
                            <div
                              ref={providedDrag.innerRef}
                              {...providedDrag.draggableProps}
                              {...providedDrag.dragHandleProps}
                              onClick={() => abrirLead(lead)}
                              className={`p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] cursor-pointer hover:bg-white/[0.06] transition-colors ${
                                snapshotDrag.isDragging ? "shadow-2xl ring-1 ring-red-500/40" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h4 className="text-xs font-bold text-white leading-snug">{lead.company_name}</h4>
                                {lead.stage === "ganho" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      arquivar(lead);
                                    }}
                                    title="Arquivar (faturado)"
                                    className="text-gray-500 hover:text-emerald-400 flex-shrink-0 transition-colors"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              {lead.contact_name && <p className="text-[11px] text-gray-400 mb-1">{lead.contact_name}</p>}
                              {lead.expected_value != null && (
                                <p className="text-[11px] font-semibold text-emerald-400 inline-flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" /> {formatarMoeda(lead.expected_value)}
                                </p>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
      )}

      {/* Drawer de detalhe do lead */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-[#0c0d12] border-l border-white/[0.08] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-400" /> {selectedLead.company_name}
              </h3>
              <button onClick={() => setSelectedLead(null)} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.06]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ESTAGIOS.map((e) => (
                <button
                  key={e.key}
                  onClick={() => {
                    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? { ...l, stage: e.key } : l)));
                    setSelectedLead((prev) => (prev ? { ...prev, stage: e.key } : prev));
                    atualizarEstagioLead(selectedLead.id, e.key);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all ${
                    selectedLead.stage === e.key ? "bg-red-500/20 border-red-500/50 text-red-300" : "border-white/[0.08] text-gray-500 hover:bg-white/[0.04]"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contato</h4>
                {!editandoContato ? (
                  <button onClick={iniciarEdicaoContato} className="text-gray-500 hover:text-white">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button onClick={salvarContato} disabled={pending} className="text-emerald-400 hover:text-emerald-300">
                    <Save className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {editandoContato ? (
                <div className="space-y-2">
                  <input className={inputClass} value={editCompanyName} onChange={(e) => setEditCompanyName(e.target.value)} placeholder="Empresa" />
                  <input className={inputClass} value={editContactName} onChange={(e) => setEditContactName(e.target.value)} placeholder="Nome do contato" />
                  <input className={inputClass} value={editContactPhone} onChange={(e) => setEditContactPhone(e.target.value)} placeholder="Telefone" />
                  <input className={inputClass} value={editContactEmail} onChange={(e) => setEditContactEmail(e.target.value)} placeholder="E-mail" />
                  <input
                    className={inputClass}
                    type="number"
                    value={editExpectedValue}
                    onChange={(e) => setEditExpectedValue(e.target.value)}
                    placeholder="Valor esperado (R$)"
                  />
                  <textarea className={inputClass} rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notas" />
                </div>
              ) : (
                <div className="space-y-1.5 text-sm text-gray-300">
                  {selectedLead.contact_name && <p>{selectedLead.contact_name}</p>}
                  {selectedLead.contact_phone && (
                    <p className="flex items-center gap-1.5 text-gray-400">
                      <Phone className="w-3.5 h-3.5" /> {selectedLead.contact_phone}
                    </p>
                  )}
                  {selectedLead.contact_email && (
                    <p className="flex items-center gap-1.5 text-gray-400">
                      <Mail className="w-3.5 h-3.5" /> {selectedLead.contact_email}
                    </p>
                  )}
                  {selectedLead.expected_value != null && (
                    <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <DollarSign className="w-3.5 h-3.5" /> {formatarMoeda(selectedLead.expected_value)}
                    </p>
                  )}
                  {selectedLead.notes && <p className="text-xs text-gray-500 pt-1 border-t border-white/[0.06] mt-2">{selectedLead.notes}</p>}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Histórico</h4>
              <div className="space-y-2">
                <select
                  value={novaInteracaoTipo}
                  onChange={(e) => setNovaInteracaoTipo(e.target.value as InteractionType)}
                  className={`${inputClass} w-full`}
                >
                  {(Object.keys(INTERACAO_LABEL) as InteractionType[]).map((t) => (
                    <option key={t} value={t} className="bg-[#111625]">
                      {INTERACAO_LABEL[t]}
                    </option>
                  ))}
                </select>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={novaInteracaoTexto}
                  onChange={(e) => setNovaInteracaoTexto(e.target.value)}
                  placeholder="Registrar..."
                  onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && adicionarInteracao()}
                />
                <div className="flex justify-end">
                  <button onClick={adicionarInteracao} className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-500 text-white">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {loadingInteractions ? (
                <p className="text-xs text-gray-500">Carregando...</p>
              ) : interactions.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhuma interação registrada.</p>
              ) : (
                <div className="space-y-2">
                  {interactions.map((i) => (
                    <div key={i.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs">
                      <span className="font-bold text-red-400">{INTERACAO_LABEL[i.interaction_type]}</span>
                      <span className="text-gray-500"> · {new Date(i.created_at).toLocaleString("pt-BR")}</span>
                      <p className="text-gray-300 mt-1">{i.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              {selectedLead.stage === "ganho" && (
                <button
                  onClick={() => arquivar(selectedLead)}
                  disabled={pending}
                  className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  <Archive className="w-3.5 h-3.5" /> Arquivar (faturado)
                </button>
              )}
              <button
                onClick={() => excluir(selectedLead)}
                className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir oportunidade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nova oportunidade */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0c0d12] border border-white/[0.08] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Nova Oportunidade</h3>
              <button onClick={() => setModalAberto(false)} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.06]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setOrigemCliente("novo")}
                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  origemCliente === "novo" ? "bg-red-500/10 border-red-500/50 text-red-400" : "border-white/[0.08] text-gray-400"
                }`}
              >
                Cliente Novo
              </button>
              <button
                onClick={() => setOrigemCliente("existente")}
                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  origemCliente === "existente" ? "bg-red-500/10 border-red-500/50 text-red-400" : "border-white/[0.08] text-gray-400"
                }`}
              >
                Cliente Cadastrado
              </button>
            </div>

            {origemCliente === "novo" ? (
              <div>
                <label className={labelClass}>Nome da Empresa</label>
                <input className={inputClass} value={novoCompanyName} onChange={(e) => setNovoCompanyName(e.target.value)} />
              </div>
            ) : (
              <div>
                <label className={labelClass}>Cliente</label>
                <select value={clienteSelecionadoId} onChange={(e) => selecionarClienteExistente(e.target.value)} className={inputClass}>
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
            )}

            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} value={novoContactName} onChange={(e) => setNovoContactName(e.target.value)} placeholder="Contato" />
              <input className={inputClass} value={novoContactPhone} onChange={(e) => setNovoContactPhone(e.target.value)} placeholder="Telefone" />
            </div>
            <input className={inputClass} value={novoContactEmail} onChange={(e) => setNovoContactEmail(e.target.value)} placeholder="E-mail" />
            <input
              className={inputClass}
              type="number"
              value={novoExpectedValue}
              onChange={(e) => setNovoExpectedValue(e.target.value)}
              placeholder="Valor esperado (R$)"
            />
            <textarea className={inputClass} rows={2} value={novoNotes} onChange={(e) => setNovoNotes(e.target.value)} placeholder="Notas" />

            {formErro && <p className="text-xs text-red-400">{formErro}</p>}

            <button
              onClick={criarNovaOportunidade}
              disabled={pending}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
            >
              {pending ? "Criando..." : "Criar Oportunidade"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
