import Link from "next/link";
import { PlusCircle, Users, Clock } from "lucide-react";
import { listarTurmas } from "@/app/actions/turmas";
import { formatarDataBR } from "@/lib/shared/date-format";

const STATUS_LABEL: Record<string, string> = { agendada: "Agendada", em_andamento: "Em andamento" };
const STATUS_COLOR: Record<string, string> = {
  agendada: "bg-white/[0.06] text-gray-400 border-white/[0.1]",
  em_andamento: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

export default async function TurmasPage() {
  const { data: turmas } = await listarTurmas();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Turmas</h1>
          <p className="text-sm text-gray-400 mt-1">Turmas agendadas ou em andamento — abra em Apresentação pra conduzir a aula.</p>
        </div>
        <Link
          href="/treinamentos/turmas/nova"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Nova Turma
        </Link>
      </div>

      {turmas.length === 0 && (
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-gray-400 flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-600" />
          Nenhuma turma agendada ainda.
        </div>
      )}

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
            <p className="text-xs text-gray-500 mb-3">{t.clienteNome ?? "Sem cliente vinculado"}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {t.instrutor_nome && <span>{t.instrutor_nome}</span>}
              {t.scheduled_at && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatarDataBR(t.scheduled_at)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
