import { CursoForm } from "@/components/features/treinamentos/curso-form";

export default function NovoCursoPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Novo Curso</h1>
        <p className="text-sm text-gray-400 mt-1">Cria o curso vazio — os subtemas e a ordem do currículo são definidos na tela do curso.</p>
      </div>

      <CursoForm />
    </div>
  );
}
