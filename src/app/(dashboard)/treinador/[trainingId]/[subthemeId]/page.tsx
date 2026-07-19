import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, ScrollText, Lightbulb, Video, ClipboardCheck, Flag, Check, X } from "lucide-react";
import { buscarAula, listarAulasDoCurso } from "@/app/actions/treinador";
import { ConteudoMarkdown } from "@/components/features/treinador/conteudo-markdown";

export default async function AulaTreinadorPage({
  params,
}: {
  params: Promise<{ trainingId: string; subthemeId: string }>;
}) {
  const { trainingId, subthemeId } = await params;
  const [{ data: aula }, { curso, data: aulas }] = await Promise.all([
    buscarAula(subthemeId),
    listarAulasDoCurso(trainingId),
  ]);

  if (!aula || !aula.conteudo) notFound();

  const c = aula.conteudo;
  const idx = aulas.findIndex((a) => a.id === subthemeId);
  const anterior = idx > 0 ? aulas[idx - 1] : null;
  const proxima = idx >= 0 && idx < aulas.length - 1 ? aulas[idx + 1] : null;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link href={`/treinador/${trainingId}`} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> {curso?.name ?? "Voltar ao curso"}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">{aula.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {c.duracao}
          </span>
          <span>{c.modulo}</span>
          <span className="text-gray-600">{c.norma}</span>
        </div>
      </div>

      <BlocoEtapa icon={ScrollText} titulo={c.contexto.titulo} corpo={c.contexto.corpo_md} />
      <BlocoEtapa icon={Lightbulb} titulo={c.explicacao.titulo} corpo={c.explicacao.corpo_md} />
      <BlocoEtapa icon={Video} titulo={c.recurso.titulo} corpo={c.recurso.corpo_md} />

      <section className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-bold text-white">{c.verificacao.titulo}</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">{c.verificacao.evidencia}</p>
        <div className="space-y-5">
          {c.verificacao.questoes.map((q, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-white mb-2">
                {i + 1}. {q.pergunta}
              </p>
              <div className="space-y-1.5">
                {q.opcoes.map((o, j) => (
                  <div
                    key={j}
                    className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg border ${
                      o.correta ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-white/[0.02] border-white/[0.06] text-gray-400"
                    }`}
                  >
                    {o.correta ? <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> : <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-30" />}
                    <span>{o.texto}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="p-5 rounded-2xl bg-gradient-to-br from-red-950/30 to-transparent border border-red-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Flag className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-bold text-white">{c.fechamento.titulo}</h2>
        </div>
        <ol className="space-y-2 mb-4">
          {c.fechamento.pontos_chave.map((p, i) => (
            <li key={i} className="text-sm text-gray-200 flex gap-2">
              <span className="text-red-400 font-bold">{i + 1}.</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
        {c.fechamento.ponte && <p className="text-xs text-gray-400 italic border-t border-white/[0.06] pt-3">{c.fechamento.ponte}</p>}
      </section>

      <div className="flex items-center justify-between pt-2 pb-8">
        {anterior ? (
          <Link
            href={`/treinador/${trainingId}/${anterior.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {anterior.name}
          </Link>
        ) : (
          <span />
        )}
        {proxima && (
          <Link
            href={proxima.temConteudo ? `/treinador/${trainingId}/${proxima.id}` : "#"}
            className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
              proxima.temConteudo ? "text-gray-400 hover:text-white" : "text-gray-700 cursor-not-allowed"
            }`}
          >
            {proxima.name} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

function BlocoEtapa({ icon: Icon, titulo, corpo }: { icon: React.ElementType; titulo: string; corpo: string }) {
  return (
    <section className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-red-400" />
        <h2 className="text-sm font-bold text-white">{titulo}</h2>
      </div>
      <ConteudoMarkdown>{corpo}</ConteudoMarkdown>
    </section>
  );
}
