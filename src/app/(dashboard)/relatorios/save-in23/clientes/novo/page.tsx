import { ClienteForm } from "@/components/features/save-in23/cliente-form";

export default async function NovoClienteSave23Page({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Cadastrar Edificação</h1>
        <p className="text-sm text-gray-400 mt-1">Preencha os dados da edificação com SAVE para vistoria ou laudo técnico (IN 23).</p>
      </div>
      <ClienteForm redirectTo={redirectTo} />
    </div>
  );
}
