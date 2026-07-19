import { notFound } from "next/navigation";
import { buscarSubtema, listarCursosParaVinculo } from "@/app/actions/subtemas";
import { SubtemaForm } from "@/components/features/treinamentos/subtema-form";

export default async function EditarSubtemaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data: subtema }, { data: cursos }] = await Promise.all([buscarSubtema(id), listarCursosParaVinculo()]);

  if (!subtema) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Editar Subtema</h1>
        <p className="text-sm text-gray-400 mt-1">{subtema.name}</p>
      </div>

      <SubtemaForm cursos={cursos} subtemaExistente={subtema} />
    </div>
  );
}
