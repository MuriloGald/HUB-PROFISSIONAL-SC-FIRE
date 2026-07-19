import { listarCursosParaVinculo } from "@/app/actions/subtemas";
import { listarClientes } from "@/app/actions/clientes";
import { NovaTurmaForm } from "@/components/features/turmas/nova-turma-form";

export default async function NovaTurmaPage() {
  const [{ data: cursos }, { data: clientes }] = await Promise.all([listarCursosParaVinculo(), listarClientes()]);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Nova Turma</h1>
        <p className="text-sm text-gray-400 mt-1">Vincula um curso a um cliente — depois é só abrir em Apresentação pra iniciar a aula.</p>
      </div>

      <NovaTurmaForm cursos={cursos} clientes={clientes} />
    </div>
  );
}
