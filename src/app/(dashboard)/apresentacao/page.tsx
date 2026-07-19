import Link from "next/link";
import { Presentation, Users, Clock, PlusCircle } from "lucide-react";
import { listarCursosTreinador } from "@/app/actions/treinador";
import { listarTurmas } from "@/app/actions/turmas";

const STATUS_LABEL: Record<string, string> = { agendada: "Agendada", em_andamento: "Em andamento" };
const STATUS_COLOR: Record<string, string> = {
  agendada: "bg-white/[0.06] text-gray-400 border-white/[0.1]",
  em_andamento: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

export default async function ApresentacaoPage() {
  const [{ data: cursos }, { data: turmas }] = await Promise.all([listarCursosTreinador(), listarTurmas()]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Apresentação</h1>
        <p className="text-sm text-gray-400 mt-1">Abra o cockpit do instrutor pra conduzir a aula em tela cheia.</p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-bold text-white">Turma Cadastrada</h2>
          </div>
          <Link href="/treinamentos/turmas/nova" className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
            <PlusCircle className="w-3.5 h-3.5" /> Nova turma
          </Link>
        </div>
        <p className="text-xs text-gray-500 mb-4">Turma com cliente vinculado — registra presença por QR Code.</p>

        {turmas.length === 0 ? (
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-gray-500">Nenhuma turma agendada — crie uma em &quot;Nova turma&quot;.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {turmas.map((t) => (
              <Link
                key={t.id}
                href={`/apresentacao/turma/${t.id}`}
                className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-red-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">{t.trainingName}</h3>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${STATUS_COLOR[t.status] ?? ""}`}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{t.clienteNome ?? "Sem cliente vinculado"}</p>
              </Link>
            ))}
          </div>
        )}
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
