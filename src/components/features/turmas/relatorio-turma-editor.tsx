"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { buscarRelatorioTurmaParaEdicao, salvarEdicaoRelatorioTurma } from "@/app/actions/turmas";
import { aplicarEdicaoRelatorio } from "@/lib/turmas/relatorio-edicao";
import type { RelatorioTurmaData, RelatorioTurmaEdicao } from "@/lib/turmas/relatorio-types";

interface Form {
  trainingName: string;
  totalHours: string;
  clienteNome: string;
  instrutorNome: string;
  dataTreinamento: string;
  totalPresentes: string;
  incendioPercent: string;
  socorrosPercent: string;
  mediaGeralPercent: string;
  comentarios: string[];
  observacoes: string;
}

const pct = (n: number) => n.toFixed(0);

function paraForm(d: RelatorioTurmaData): Form {
  const id = d.identificacao;
  const av = d.avaliacao;
  return {
    trainingName: id.trainingName ?? "",
    totalHours: id.totalHours != null ? String(id.totalHours) : "",
    clienteNome: id.clienteNome ?? "",
    instrutorNome: id.instrutorNome ?? "",
    dataTreinamento: (id.scheduledAt || id.finishedAt || "").slice(0, 10),
    totalPresentes: String(av.totalPresentes),
    incendioPercent: pct(av.incendio.mediaAcertosPercent),
    socorrosPercent: pct(av.socorros.mediaAcertosPercent),
    mediaGeralPercent: pct(av.mediaGeralPercent),
    comentarios: [...d.satisfacao.comentarios],
    observacoes: d.observacoes ?? "",
  };
}

const numOuNull = (s: string): number | null => {
  const t = s.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

/** Compara o formulário com os dados calculados e devolve só o que mudou. */
function diferencas(form: Form, base: Form): { edicao: RelatorioTurmaEdicao; erro?: string } {
  const e: RelatorioTurmaEdicao = {};
  const texto = (k: "trainingName" | "clienteNome" | "instrutorNome") => form[k].trim() !== base[k].trim();

  if (texto("trainingName")) e.trainingName = form.trainingName.trim();
  if (texto("clienteNome")) e.clienteNome = form.clienteNome.trim() || null;
  if (texto("instrutorNome")) e.instrutorNome = form.instrutorNome.trim() || null;
  if (form.dataTreinamento !== base.dataTreinamento) e.dataTreinamento = form.dataTreinamento || null;

  if (form.totalHours.trim() !== base.totalHours.trim()) {
    const n = numOuNull(form.totalHours);
    if (form.totalHours.trim() && n === null) return { edicao: e, erro: "Carga horária inválida." };
    e.totalHours = n;
  }

  if (form.totalPresentes.trim() !== base.totalPresentes) {
    const n = numOuNull(form.totalPresentes);
    if (n === null || n < 0 || !Number.isInteger(n)) return { edicao: e, erro: "Nº de presentes inválido." };
    e.totalPresentes = n;
  }

  const percentuais = [
    ["incendioPercent", "Prova 1 (Incêndio)"],
    ["socorrosPercent", "Prova 2 (Primeiros Socorros)"],
    ["mediaGeralPercent", "Média geral"],
  ] as const;
  for (const [k, rotulo] of percentuais) {
    if (form[k].trim() === base[k]) continue;
    const n = numOuNull(form[k]);
    if (n === null || n < 0 || n > 100) return { edicao: e, erro: `${rotulo}: informe um percentual entre 0 e 100.` };
    e[k] = n;
  }

  const comentarios = form.comentarios.map((c) => c.trim()).filter(Boolean);
  if (JSON.stringify(comentarios) !== JSON.stringify(base.comentarios)) e.comentarios = comentarios;

  if (form.observacoes.trim()) e.observacoes = form.observacoes.trim();

  return { edicao: e };
}

const INPUT =
  "w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors";
const LABEL = "block text-xs font-semibold text-gray-400 mb-1.5";
const SECAO = "text-xs font-bold uppercase tracking-wider text-red-400 mb-3";

export function RelatorioTurmaEditor({ classId, onFechar, onSalvo }: { classId: string; onFechar: () => void; onSalvo: () => void }) {
  const [base, setBase] = useState<Form | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [temEdicao, setTemEdicao] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarRelatorioTurmaParaEdicao(classId).then((res) => {
      if ("error" in res) {
        setErro(res.error);
        return;
      }
      const b = paraForm(res.data.base);
      setBase(b);
      setForm(paraForm(aplicarEdicaoRelatorio(res.data.base, res.data.edicao)));
      setTemEdicao(!!res.data.edicao && Object.keys(res.data.edicao).length > 0);
    });
  }, [classId]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && !salvando && onFechar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFechar, salvando]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  async function salvar(edicao: RelatorioTurmaEdicao | null) {
    setErro("");
    setSalvando(true);
    const res = await salvarEdicaoRelatorioTurma(classId, edicao);
    setSalvando(false);
    if ("error" in res && res.error) {
      setErro(res.error);
      return;
    }
    onSalvo();
  }

  function handleSalvar() {
    if (!form || !base) return;
    const { edicao, erro: erroValidacao } = diferencas(form, base);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    salvar(edicao);
  }

  function handleRestaurar() {
    if (!window.confirm("Descartar todas as edições e voltar aos dados calculados automaticamente?")) return;
    salvar(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !salvando && onFechar()}>
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-950 border border-white/[0.1] shadow-2xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/[0.08]">
          <div>
            <h2 className="text-lg font-bold text-white">Editar Relatório da Turma</h2>
            <p className="text-xs text-gray-500">As alterações valem para o PDF, .docx e Google Docs.</p>
          </div>
          <button onClick={onFechar} disabled={salvando} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06]" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!form || !base ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
            {erro ? <span className="text-red-400">{erro}</span> : <><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</>}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
              <section>
                <h3 className={SECAO}>1. Identificação</h3>
                <div className="space-y-4">
                  <div>
                    <label className={LABEL}>Curso</label>
                    <input className={INPUT} value={form.trainingName} onChange={(e) => set("trainingName", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Data do treinamento</label>
                      <input type="date" className={INPUT} value={form.dataTreinamento} onChange={(e) => set("dataTreinamento", e.target.value)} />
                    </div>
                    <div>
                      <label className={LABEL}>Carga horária (h)</label>
                      <input inputMode="decimal" className={INPUT} value={form.totalHours} onChange={(e) => set("totalHours", e.target.value)} />
                    </div>
                    <div>
                      <label className={LABEL}>Cliente</label>
                      <input className={INPUT} value={form.clienteNome} onChange={(e) => set("clienteNome", e.target.value)} />
                    </div>
                    <div>
                      <label className={LABEL}>Instrutor</label>
                      <input className={INPUT} value={form.instrutorNome} onChange={(e) => set("instrutorNome", e.target.value)} />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className={SECAO}>2. Avaliação de aprendizagem</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className={LABEL}>Alunos presentes</label>
                    <input inputMode="numeric" className={INPUT} value={form.totalPresentes} onChange={(e) => set("totalPresentes", e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL}>Prova 1 – Incêndio (%)</label>
                    <input inputMode="decimal" className={INPUT} value={form.incendioPercent} onChange={(e) => set("incendioPercent", e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL}>Prova 2 – Socorros (%)</label>
                    <input inputMode="decimal" className={INPUT} value={form.socorrosPercent} onChange={(e) => set("socorrosPercent", e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL}>Média geral (%)</label>
                    <input inputMode="decimal" className={INPUT} value={form.mediaGeralPercent} onChange={(e) => set("mediaGeralPercent", e.target.value)} />
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Calculado: {base.totalPresentes} presentes · Incêndio {base.incendioPercent}% · Socorros {base.socorrosPercent}% · Média {base.mediaGeralPercent}%
                </p>
              </section>

              <section>
                <h3 className={SECAO}>4. Comentários dos alunos</h3>
                <div className="space-y-2">
                  {form.comentarios.length === 0 && <p className="text-xs text-gray-500 italic">Nenhum comentário.</p>}
                  {form.comentarios.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <textarea
                        rows={2}
                        className={`${INPUT} resize-y`}
                        value={c}
                        onChange={(e) => set("comentarios", form.comentarios.map((x, j) => (j === i ? e.target.value : x)))}
                      />
                      <button
                        type="button"
                        onClick={() => set("comentarios", form.comentarios.filter((_, j) => j !== i))}
                        className="self-start p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/[0.06]"
                        title="Remover comentário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => set("comentarios", [...form.comentarios, ""])}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-400"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar comentário
                  </button>
                </div>
              </section>

              <section>
                <h3 className={SECAO}>5. Observações do instrutor</h3>
                <textarea
                  rows={4}
                  className={`${INPUT} resize-y`}
                  placeholder="Opcional — aparece como seção 5 no relatório."
                  value={form.observacoes}
                  onChange={(e) => set("observacoes", e.target.value)}
                />
              </section>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.08]">
              <div>
                {temEdicao && (
                  <button
                    onClick={handleRestaurar}
                    disabled={salvando}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-amber-400 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restaurar dados originais
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {erro && <span className="text-xs text-red-400">{erro}</span>}
                <button onClick={onFechar} disabled={salvando} className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white disabled:opacity-50">
                  Cancelar
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {salvando && <Loader2 className="w-4 h-4 animate-spin" />}
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
