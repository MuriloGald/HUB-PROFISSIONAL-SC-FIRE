import { ClienteForm } from "@/components/features/laudos/cliente-form";

export default async function NovoClienteEventoPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Cadastrar Cliente</h1>
        <p className="text-sm text-gray-400 mt-1">Preencha os dados do responsável legal ou empresa organizadora do evento.</p>
      </div>
      <ClienteForm redirectTo={redirectTo} />
    </div>
  );
}
