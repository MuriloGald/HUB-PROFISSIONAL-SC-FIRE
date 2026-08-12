import { ProfissionalForm } from "@/components/features/profissionais/profissional-form";

export default async function NovoProfissionalPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Cadastrar Profissional</h1>
        <p className="text-sm text-gray-400 mt-1">Preencha os dados do Responsável Técnico (CREA/CFT) — fica disponível para todos os módulos de documento.</p>
      </div>
      <ProfissionalForm redirectTo={redirectTo} />
    </div>
  );
}
