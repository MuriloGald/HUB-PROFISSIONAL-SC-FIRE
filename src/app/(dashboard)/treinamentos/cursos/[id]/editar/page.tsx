import { notFound } from "next/navigation";
import { buscarCurso } from "@/app/actions/subtemas";
import { CursoForm } from "@/components/features/treinamentos/curso-form";

export default async function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: curso } = await buscarCurso(id);

  if (!curso) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Editar Curso</h1>
        <p className="text-sm text-gray-400 mt-1">{curso.name}</p>
      </div>

      <CursoForm cursoExistente={curso} />
    </div>
  );
}
