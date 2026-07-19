import { notFound } from "next/navigation";
import { listarAulasDoCurso } from "@/app/actions/treinador";
import { CockpitInstrutor } from "@/components/features/treinador/cockpit-instrutor";

export default async function CockpitAvulsoPage({ params }: { params: Promise<{ trainingId: string }> }) {
  const { trainingId } = await params;
  const { curso, data: aulas } = await listarAulasDoCurso(trainingId);

  if (!curso || aulas.length === 0) notFound();

  return <CockpitInstrutor curso={curso} aulas={aulas} />;
}
