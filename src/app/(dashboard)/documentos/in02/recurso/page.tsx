import { listarRecursos } from "@/app/actions/in02";
import { RecursoList } from "@/components/features/in02/recurso-list";

export default async function RecursosPage() {
  const { data: laudos } = await listarRecursos();
  return <RecursoList laudos={laudos} />;
}
