"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Check, PlusCircle, ChevronUp, ChevronDown } from "lucide-react";
import { adicionarSubtemaAoCurso, atualizarDuracaoSubtema, definirPosicaoSubtema, moverSubtemaNoCurso, removerSubtemaDoCurso } from "@/app/actions/subtemas";
import type { SubtemaDoCurso } from "@/app/actions/subtemas";

interface CurriculoCursoProps {
  trainingId: string;
  subtemasDoCurso: SubtemaDoCurso[];
  disponiveisParaAdicionar: { id: string; name: string; category: string; level: string }[];
}

export function CurriculoCurso({ trainingId, subtemasDoCurso, disponiveisParaAdicionar }: CurriculoCursoProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [horasEditando, setHorasEditando] = useState<Record<string, string>>({});
  const [posicaoEditando, setPosicaoEditando] = useState<Record<string, string>>({});
  const [subtemaParaAdicionar, setSubtemaParaAdicionar] = useState("");
  const [sortOrderNovo, setSortOrderNovo] = useState(String(subtemasDoCurso.length));

  const totalHoras = subtemasDoCurso.reduce((acc, s) => acc + s.hours, 0);

  function salvarDuracao(subthemeId: string) {
    const valor = horasEditando[subthemeId];
    if (valor === undefined) return;
    const hours = parseFloat(valor.replace(",", ".")) || 0;
    startTransition(async () => {
      const res = await atualizarDuracaoSubtema(subthemeId, hours);
      if (res.error) {
        alert(res.error);
        return;
      }
      setHorasEditando((prev) => {
        const next = { ...prev };
        delete next[subthemeId];
        return next;
      });
      router.refresh();
    });
  }

  function salvarPosicao(subthemeId: string) {
    const valor = posicaoEditando[subthemeId];
    if (valor === undefined) return;
    const posicao = parseInt(valor, 10);
    if (!posicao || posicao < 1) {
      alert("Informe uma posição válida (1 ou maior).");
      return;
    }
    startTransition(async () => {
      const res = await definirPosicaoSubtema(trainingId, subthemeId, posicao);
      if (res.error) {
        alert(res.error);
        return;
      }
      setPosicaoEditando((prev) => {
        const next = { ...prev };
        delete next[subthemeId];
        return next;
      });
      router.refresh();
    });
  }

  function remover(subthemeId: string, name: string) {
    if (!confirm(`Remover "${name}" deste curso? O subtema continua no catálogo.`)) return;
    startTransition(async () => {
      const res = await removerSubtemaDoCurso(trainingId, subthemeId);
      if (res.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  function mover(subthemeId: string, direcao: "up" | "down") {
    startTransition(async () => {
      const res = await moverSubtemaNoCurso(trainingId, subthemeId, direcao);
      if (res.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  function adicionar() {
    if (!subtemaParaAdicionar) return;
    startTransition(async () => {
      const res = await adicionarSubtemaAoCurso(trainingId, subtemaParaAdicionar, parseInt(sortOrderNovo, 10) || 0);
      if (res.error) {
        alert(res.error);
        return;
      }
      setSubtemaParaAdicionar("");
      router.refresh();
    });
  }

  const inputClass =
    "px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white focus:outline-none focus:border-red-500/50 transition-colors";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/[0.08] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04]">
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-300 w-12">#</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-300">Aula</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-300">Módulo</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-300 w-40">Duração</th>
              <th className="text-center px-4 py-2.5 font-semibold text-gray-300 w-16">Ações</th>
            </tr>
          </thead>
          <tbody>
            {subtemasDoCurso.map((s, idx) => {
              const editando = horasEditando[s.id] !== undefined;
              const editandoPosicao = posicaoEditando[s.id] !== undefined;
              return (
                <tr key={s.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="flex flex-col -my-1">
                        <button
                          onClick={() => mover(s.id, "up")}
                          disabled={pending || idx === 0}
                          className="text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => mover(s.id, "down")}
                          disabled={pending || idx === subtemasDoCurso.length - 1}
                          className="text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        title="Posição no currículo — edite pra mover direto pra outro lugar"
                        className={`${inputClass} w-12 text-center`}
                        value={editandoPosicao ? posicaoEditando[s.id] : String(idx + 1)}
                        onChange={(e) => setPosicaoEditando((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && salvarPosicao(s.id)}
                      />
                      {editandoPosicao && (
                        <button onClick={() => salvarPosicao(s.id)} disabled={pending} className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-white font-medium">{s.name}</td>
                  <td className="px-4 py-2.5 text-gray-400">{s.category}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        className={`${inputClass} w-20`}
                        value={editando ? horasEditando[s.id] : String(s.hours)}
                        onChange={(e) => setHorasEditando((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      />
                      <span className="text-xs text-gray-500">h</span>
                      {editando && (
                        <button onClick={() => salvarDuracao(s.id)} disabled={pending} className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => remover(s.id, s.name)}
                      disabled={pending}
                      className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {subtemasDoCurso.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500 text-sm">
                  Nenhum subtema vinculado a este curso ainda.
                </td>
              </tr>
            )}
          </tbody>
          {subtemasDoCurso.length > 0 && (
            <tfoot>
              <tr className="border-t border-white/[0.08] bg-white/[0.02]">
                <td colSpan={3} className="px-4 py-2 text-xs text-gray-500 text-right">
                  Total
                </td>
                <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-white">
                  {totalHoras}h
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Adicionar subtema existente</label>
          <select className={`${inputClass} w-full`} value={subtemaParaAdicionar} onChange={(e) => setSubtemaParaAdicionar(e.target.value)}>
            <option value="">Selecione...</option>
            {disponiveisParaAdicionar.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Posição</label>
          <input className={`${inputClass} w-20`} value={sortOrderNovo} onChange={(e) => setSortOrderNovo(e.target.value)} />
        </div>
        <button
          onClick={adicionar}
          disabled={pending || !subtemaParaAdicionar}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-semibold rounded-md transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Adicionar
        </button>
        <Link
          href={`/treinamentos/subtemas/novo?curso=${trainingId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.1] hover:bg-white/[0.04] text-gray-300 text-xs font-semibold rounded-md transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Criar novo subtema
        </Link>
      </div>
    </div>
  );
}
