"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check } from "lucide-react";
import { salvarRoteiro } from "@/app/actions/subtemas";
import { ListaEditavel } from "@/components/features/plano-ensino/wizard/lista-editavel";
import type { ConteudoAula, OpcaoQuestao, QuestaoVerificacao } from "@/lib/treinador/types";

const inputClass =
  "w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors";
const labelClass = "block text-xs font-semibold text-gray-400 mb-1.5";
const sectionClass = "space-y-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08]";
const sectionTitleClass = "text-sm font-bold text-white flex items-center gap-2";

function questaoVazia(): QuestaoVerificacao {
  return {
    pergunta: "",
    opcoes: [
      { texto: "", correta: true },
      { texto: "", correta: false },
      { texto: "", correta: false },
      { texto: "", correta: false },
    ],
  };
}

function conteudoVazio(): ConteudoAula {
  return {
    duracao: "",
    norma: "",
    modulo: "",
    contexto: { titulo: "Etapa 1 — Contexto", corpo_md: "" },
    explicacao: { titulo: "Etapa 2 — Explicação", corpo_md: "" },
    recurso: { titulo: "Etapa 3 — Vídeo / Recurso Prático", corpo_md: "" },
    verificacao: { titulo: "Etapa 4 — Verificação de Aprendizagem", evidencia: "", questoes: [] },
    fechamento: { titulo: "Etapa 5 — Fechamento", pontos_chave: [], ponte: "" },
  };
}

interface RoteiroFormProps {
  subtemaId: string;
  subtemaNome: string;
  conteudoExistente: ConteudoAula | null;
}

export function RoteiroForm({ subtemaId, subtemaNome, conteudoExistente }: RoteiroFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [c, setC] = useState<ConteudoAula>(conteudoExistente ?? conteudoVazio());

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const res = await salvarRoteiro(subtemaId, c);
      if (res.error) {
        setErro(res.error);
        return;
      }
      router.push("/treinamentos/subtemas");
      router.refresh();
    });
  }

  function atualizarQuestao(idx: number, patch: Partial<QuestaoVerificacao>) {
    setC((prev) => ({
      ...prev,
      verificacao: { ...prev.verificacao, questoes: prev.verificacao.questoes.map((q, i) => (i === idx ? { ...q, ...patch } : q)) },
    }));
  }

  function atualizarOpcao(idxQuestao: number, idxOpcao: number, patch: Partial<OpcaoQuestao>) {
    setC((prev) => ({
      ...prev,
      verificacao: {
        ...prev.verificacao,
        questoes: prev.verificacao.questoes.map((q, i) =>
          i === idxQuestao ? { ...q, opcoes: q.opcoes.map((o, j) => (j === idxOpcao ? { ...o, ...patch } : o)) } : q
        ),
      },
    }));
  }

  function marcarCorreta(idxQuestao: number, idxOpcao: number) {
    setC((prev) => ({
      ...prev,
      verificacao: {
        ...prev.verificacao,
        questoes: prev.verificacao.questoes.map((q, i) =>
          i === idxQuestao ? { ...q, opcoes: q.opcoes.map((o, j) => ({ ...o, correta: j === idxOpcao })) } : q
        ),
      },
    }));
  }

  function adicionarQuestao() {
    setC((prev) => ({ ...prev, verificacao: { ...prev.verificacao, questoes: [...prev.verificacao.questoes, questaoVazia()] } }));
  }

  function removerQuestao(idx: number) {
    setC((prev) => ({ ...prev, verificacao: { ...prev.verificacao, questoes: prev.verificacao.questoes.filter((_, i) => i !== idx) } }));
  }

  return (
    <div className="space-y-6">
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Metadados</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Duração</label>
            <input className={inputClass} value={c.duracao} onChange={(e) => setC({ ...c, duracao: e.target.value })} placeholder="Ex: 1h" />
          </div>
          <div>
            <label className={labelClass}>Módulo</label>
            <input className={inputClass} value={c.modulo} onChange={(e) => setC({ ...c, modulo: e.target.value })} placeholder="Ex: Noções de Extinção" />
          </div>
          <div>
            <label className={labelClass}>Norma</label>
            <input className={inputClass} value={c.norma} onChange={(e) => setC({ ...c, norma: e.target.value })} placeholder="Ex: IN 28/2024 CBMSC" />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Etapa 1 — Contexto</h3>
        <input
          className={inputClass}
          value={c.contexto.titulo}
          onChange={(e) => setC({ ...c, contexto: { ...c.contexto, titulo: e.target.value } })}
        />
        <textarea
          className={inputClass}
          rows={5}
          value={c.contexto.corpo_md}
          onChange={(e) => setC({ ...c, contexto: { ...c.contexto, corpo_md: e.target.value } })}
          placeholder="Markdown — dado de abertura, pergunta disparadora..."
        />
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Etapa 2 — Explicação</h3>
        <input
          className={inputClass}
          value={c.explicacao.titulo}
          onChange={(e) => setC({ ...c, explicacao: { ...c.explicacao, titulo: e.target.value } })}
        />
        <textarea
          className={inputClass}
          rows={10}
          value={c.explicacao.corpo_md}
          onChange={(e) => setC({ ...c, explicacao: { ...c.explicacao, corpo_md: e.target.value } })}
          placeholder="Markdown — conteúdo técnico, tabelas, subtítulos ###..."
        />
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Etapa 3 — Vídeo / Recurso Prático</h3>
        <input
          className={inputClass}
          value={c.recurso.titulo}
          onChange={(e) => setC({ ...c, recurso: { ...c.recurso, titulo: e.target.value } })}
        />
        <textarea
          className={inputClass}
          rows={5}
          value={c.recurso.corpo_md}
          onChange={(e) => setC({ ...c, recurso: { ...c.recurso, corpo_md: e.target.value } })}
          placeholder="Markdown — sugestão de vídeo ou dinâmica prática..."
        />
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Etapa 4 — Verificação de Aprendizagem</h3>
        <input
          className={inputClass}
          value={c.verificacao.titulo}
          onChange={(e) => setC({ ...c, verificacao: { ...c.verificacao, titulo: e.target.value } })}
        />
        <input
          className={inputClass}
          value={c.verificacao.evidencia}
          onChange={(e) => setC({ ...c, verificacao: { ...c.verificacao, evidencia: e.target.value } })}
          placeholder="Evidência documental (ex: registrar nome e respostas...)"
        />

        <div className="space-y-4 pt-2">
          {c.verificacao.questoes.map((q, qi) => (
            <div key={qi} className="p-4 rounded-xl bg-black/20 border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2">
                <input
                  className={`${inputClass} flex-1`}
                  value={q.pergunta}
                  onChange={(e) => atualizarQuestao(qi, { pergunta: e.target.value })}
                  placeholder={`Questão ${qi + 1}`}
                />
                <button onClick={() => removerQuestao(qi)} className="text-gray-500 hover:text-red-400 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {q.opcoes.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    onClick={() => marcarCorreta(qi, oi)}
                    title="Marcar como correta"
                    className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center border transition-colors ${
                      o.correta ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-white/[0.15] text-transparent hover:border-white/[0.3]"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <input
                    className={`${inputClass} flex-1`}
                    value={o.texto}
                    onChange={(e) => atualizarOpcao(qi, oi, { texto: e.target.value })}
                    placeholder={`Opção ${String.fromCharCode(97 + oi)}`}
                  />
                </div>
              ))}
            </div>
          ))}
          <button
            onClick={adicionarQuestao}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-white/[0.15] hover:border-red-500/50 hover:bg-white/[0.04] text-gray-300 hover:text-red-400 text-xs font-semibold rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Questão
          </button>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Etapa 5 — Fechamento</h3>
        <input
          className={inputClass}
          value={c.fechamento.titulo}
          onChange={(e) => setC({ ...c, fechamento: { ...c.fechamento, titulo: e.target.value } })}
        />
        <div>
          <label className={labelClass}>Pontos-chave</label>
          <ListaEditavel
            itens={c.fechamento.pontos_chave}
            onChange={(pontos_chave) => setC({ ...c, fechamento: { ...c.fechamento, pontos_chave } })}
            placeholder="Adicionar ponto-chave..."
          />
        </div>
        <div>
          <label className={labelClass}>Ponte para o próximo componente</label>
          <textarea
            className={inputClass}
            rows={3}
            value={c.fechamento.ponte}
            onChange={(e) => setC({ ...c, fechamento: { ...c.fechamento, ponte: e.target.value } })}
          />
        </div>
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <button
        onClick={salvar}
        disabled={pending}
        className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {pending ? "Salvando..." : `Salvar Roteiro — ${subtemaNome}`}
      </button>
    </div>
  );
}
