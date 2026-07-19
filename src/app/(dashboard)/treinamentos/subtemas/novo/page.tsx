import { listarCursosParaVinculo } from "@/app/actions/subtemas";
import { SubtemaForm } from "@/components/features/treinamentos/subtema-form";

export default async function NovoSubtemaPage({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const { data: cursos } = await listarCursosParaVinculo();
  const { curso } = await searchParams;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Subtema</h1>
        <p className="text-sm text-gray-400 mt-1">Cadastra uma aula/componente no catálogo, opcionalmente já vinculada a um curso.</p>
      </div>

      <SubtemaForm cursos={cursos} cursoPreselecionado={curso} />
    </div>
  );
}
