import Link from "next/link";
import { PlusCircle, BookOpen, CircleCheck, CircleDashed } from "lucide-react";
import { listarSubtemas } from "@/app/actions/subtemas";
import { SubtemaRowActions } from "@/components/features/treinamentos/subtema-row-actions";

export default async function SubtemasPage() {
  const { data: subtemas } = await listarSubtemas();

  const niveis = Array.from(new Set(subtemas.map((s) => s.level)));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Subtemas</h1>
          <p className="text-sm text-gray-400 mt-1">Catálogo de aulas/componentes usados pelos cursos e pelo módulo do Treinador.</p>
        </div>
        <Link
          href="/treinamentos/subtemas/novo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Novo Subtema
        </Link>
      </div>

      {subtemas.length === 0 && (
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-gray-400 flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-gray-600" />
          Nenhum subtema cadastrado ainda.
        </div>
      )}

      {niveis.map((nivel) => (
        <section key={nivel}>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{nivel}</h2>
          <div className="rounded-xl border border-white/[0.08] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04]">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-300">Nome</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-300">Módulo</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-300">Carga</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-300">Curso vinculado</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-gray-300">Roteiro</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {subtemas
                  .filter((s) => s.level === nivel)
                  .map((s) => (
                    <tr key={s.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-white font-medium">{s.name}</td>
                      <td className="px-4 py-2.5 text-gray-400">{s.category}</td>
                      <td className="px-4 py-2.5 text-gray-400">{s.hours}h</td>
                      <td className="px-4 py-2.5 text-gray-400">{s.cursoVinculado ?? "—"}</td>
                      <td className="px-4 py-2.5 text-center">
                        {s.temConteudo ? (
                          <CircleCheck className="w-4 h-4 text-emerald-500 inline-block" />
                        ) : (
                          <CircleDashed className="w-4 h-4 text-gray-600 inline-block" />
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <SubtemaRowActions id={s.id} name={s.name} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
