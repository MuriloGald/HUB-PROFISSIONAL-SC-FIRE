import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { listarCursoDetalhe } from "@/app/actions/subtemas";
import { CurriculoCurso } from "@/components/features/treinamentos/curriculo-curso";

export default async function CursoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { curso, subtemasDoCurso, disponiveisParaAdicionar } = await listarCursoDetalhe(id);

  if (!curso) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/treinamentos/cursos" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos cursos
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">{curso.name}</h1>
        <p className="text-sm text-gray-400 mt-1">{curso.description}</p>
      </div>

      <CurriculoCurso trainingId={id} subtemasDoCurso={subtemasDoCurso} disponiveisParaAdicionar={disponiveisParaAdicionar} />
    </div>
  );
}
