import Link from "next/link";
import { GraduationCap, Clock } from "lucide-react";
import { listarCursosTreinador } from "@/app/actions/treinador";

export default async function CursosPage() {
  const { data: cursos } = await listarCursosTreinador();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Cursos</h1>
        <p className="text-sm text-gray-400 mt-1">Gerencie o currículo de cada curso — adicione, remova ou ajuste a duração dos subtemas.</p>
      </div>

      {cursos.length === 0 && (
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-gray-400">Nenhum curso cadastrado ainda.</div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cursos.map((c) => (
          <Link
            key={c.id}
            href={`/treinamentos/cursos/${c.id}`}
            className="group relative flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center shadow-lg shadow-black/30 mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors font-display">{c.name}</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">{c.description}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {c.total_hours}h de carga horária
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
