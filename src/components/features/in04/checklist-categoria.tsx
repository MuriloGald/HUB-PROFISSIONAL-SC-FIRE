"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, Pencil, Plus, Trash2 } from "lucide-react";
import { EquipamentoForm } from "./equipamento-form";
import { CATEGORIAS_IN04 } from "@/lib/in04/constants";
import type { CategoriaChecklist } from "@/lib/in04/constants";
import { novoEquipamento } from "@/lib/in04/types";
import type { CategoriaKey, EquipamentoVistoriado, Pavimento } from "@/lib/in04/types";

interface ChecklistCategoriaProps {
  pavimento: Pavimento;
  categoriaAtiva: CategoriaKey;
  onSetCategoriaAtiva: (key: CategoriaKey) => void;
  onChangeItens: (categoria: CategoriaKey, itens: EquipamentoVistoriado[]) => void;
}

export function ChecklistCategoria({ pavimento, categoriaAtiva, onSetCategoriaAtiva, onChangeItens }: ChecklistCategoriaProps) {
  const categoria = CATEGORIAS_IN04.find((c) => c.key === categoriaAtiva) ?? CATEGORIAS_IN04[0];

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIAS_IN04.map((c) => {
          const Icon = c.icon;
          const count = pavimento.itens[c.key]?.length ?? 0;
          const ativa = c.key === categoria.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onSetCategoriaAtiva(c.key)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border transition-all ${
                ativa ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:bg-white/[0.05]"
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold whitespace-nowrap">{c.titulo}</span>
            </button>
          );
        })}
      </div>

      {/* Chave = pavimento+categoria — remonta (e reseta o item em edição) sempre que o usuário troca de aba ou de pavimento, em vez de sincronizar isso via effect. */}
      <CategoriaBody
        key={`${pavimento.id}:${categoria.key}`}
        categoria={categoria}
        pavimento={pavimento}
        itens={pavimento.itens[categoria.key] ?? []}
        onChangeItens={(itens) => onChangeItens(categoria.key, itens)}
      />
    </div>
  );
}

function CategoriaBody({
  categoria,
  pavimento,
  itens,
  onChangeItens,
}: {
  categoria: CategoriaChecklist;
  pavimento: Pavimento;
  itens: EquipamentoVistoriado[];
  onChangeItens: (itens: EquipamentoVistoriado[]) => void;
}) {
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const editando = itens.find((e) => e.id === editandoId);

  function atualizarItem(item: EquipamentoVistoriado) {
    onChangeItens(itens.map((e) => (e.id === item.id ? item : e)));
  }

  function removerItem(id: string) {
    if (!confirm("Remover este item lançado?")) return;
    onChangeItens(itens.filter((e) => e.id !== id));
    if (editandoId === id) setEditandoId(null);
  }

  function adicionar() {
    const item = novoEquipamento();
    onChangeItens([...itens, item]);
    setEditandoId(item.id);
  }

  function resumoItem(item: EquipamentoVistoriado): { icon: React.ReactNode; texto: string } {
    const respostas = Object.values(item.respostas);
    const naoConformidades = respostas.filter((r) => r.resposta === "nao").length;
    if (naoConformidades > 0) {
      return { icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, texto: `${naoConformidades} não conformidade(s)` };
    }
    const respondidas = respostas.filter((r) => r.resposta === "sim" || r.resposta === "na").length;
    if (respondidas >= categoria.perguntas.length && categoria.perguntas.length > 0) {
      return { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, texto: "Conforme" };
    }
    return { icon: <CircleDashed className="w-4 h-4 text-gray-500" />, texto: "Checklist incompleto" };
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white">{categoria.titulo}</h3>
        <p className="text-xs text-gray-500">{categoria.normaRef} — pavimento: {pavimento.nome || "sem nome"}</p>
      </div>

      <div className="space-y-3">
        {itens.map((item) => {
          if (item.id === editandoId) {
            return <EquipamentoForm key={item.id} categoria={categoria} equipamento={item} onChange={atualizarItem} onSalvar={() => setEditandoId(null)} onCancelar={() => setEditandoId(null)} />;
          }
          const resumo = resumoItem(item);
          return (
            <div key={item.id} className="rounded-xl bg-black/20 border border-white/[0.08] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {resumo.icon}
                <div className="min-w-0">
                  <p className="text-sm text-white font-semibold truncate">{item.identificacao || "(sem identificação)"}</p>
                  <p className="text-xs text-gray-500">{resumo.texto}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditandoId(item.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-amber-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-amber-400 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removerItem(item.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-red-500/50 hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {!editando && (
          <button
            type="button"
            onClick={adicionar}
            className="w-full py-3 border border-dashed border-white/[0.15] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar {categoria.tituloSingular.toLowerCase()}
          </button>
        )}
      </div>
    </div>
  );
}
