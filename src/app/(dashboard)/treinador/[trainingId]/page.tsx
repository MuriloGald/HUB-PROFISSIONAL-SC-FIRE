import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, CircleCheck, CircleDashed, Presentation } from "lucide-react";
import { listarAulasDoCurso } from "@/app/actions/treinador";

export default async function CursoTreinadorPage({ params }: { params: Promise<{ trainingId: string }> }) {
  const { trainingId } = await params;
  const { curso, data: aulas } = await listarAulasDoCurso(trainingId);

  if (!curso) notFound();

  const modulos = Array.from(new Set(aulas.map((a) => a.category)));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/treinador" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos cursos
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">{curso.name}</h1>
          <p className="text-sm text-gray-400 mt-1">{curso.description}</p>
        </div>
        {aulas.length > 0 && (
          <Link
            href={`/apresentacao/${trainingId}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
          >
            <Presentation className="w-4 h-4" /> Iniciar Cockpit do Instrutor
          </Link>
        )}
      </div>

      <div className="space-y-8">
        {modulos.map((modulo) => (
          <section key={modulo}>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{modulo}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {aulas
                .filter((a) => a.category === modulo)
                .map((a) => (
                  <Link
                    key={a.id}
                    href={a.temConteudo ? `/treinador/${trainingId}/${a.id}` : "#"}
                    aria-disabled={!a.temConteudo}
                    className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                      a.temConteudo
                        ? "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] cursor-pointer"
                        : "bg-white/[0.01] border-white/[0.04] opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-white leading-snug">{a.name}</span>
                      {a.temConteudo ? (
                        <CircleCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <CircleDashed className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {a.hours}h {!a.temConteudo && "· roteiro ainda não migrado"}
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
