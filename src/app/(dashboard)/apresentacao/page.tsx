import Link from "next/link";
import { Presentation, Users, Clock, Lock } from "lucide-react";
import { listarCursosTreinador } from "@/app/actions/treinador";

export default async function ApresentacaoPage() {
  const { data: cursos } = await listarCursosTreinador();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Apresentação</h1>
        <p className="text-sm text-gray-400 mt-1">Abra o cockpit do instrutor pra conduzir a aula em tela cheia.</p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-bold text-white">Turma Cadastrada</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Abrir uma turma já criada (CRM/Comercial), com presença e acompanhamento pelo aluno.</p>
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 text-sm text-gray-500">
          <Lock className="w-4 h-4 flex-shrink-0" />
          Ainda não disponível — depende do módulo de Turmas/CRM, que ainda não foi construído neste Hub.
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-1">
          <Presentation className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-bold text-white">Abrir Avulso</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Abre o cockpit direto a partir de um curso, sem precisar cadastrar turma antes.</p>

        {cursos.length === 0 && (
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-gray-400">Nenhum curso cadastrado ainda.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cursos.map((c) => (
            <Link
              key={c.id}
              href={`/apresentacao/${c.id}`}
              className="group relative flex flex-col p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-red-500/30 transition-all duration-300 hover:scale-[1.01]"
            >
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-red-400 transition-colors font-display">{c.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{c.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                {c.total_hours}h
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
