import { notFound } from "next/navigation";
import { buscarProfissional } from "@/app/actions/profissionais";
import { ProfissionalForm } from "@/components/features/profissionais/profissional-form";

export default async function EditarProfissionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: profissional } = await buscarProfissional(id);

  if (!profissional) notFound();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Editar Profissional</h1>
        <p className="text-sm text-gray-400 mt-1">Atualize os dados do Responsável Técnico.</p>
      </div>
      <ProfissionalForm profissional={profissional} />
    </div>
  );
}
