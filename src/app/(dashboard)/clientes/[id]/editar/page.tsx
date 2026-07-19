import { notFound } from "next/navigation";
import { buscarCliente } from "@/app/actions/clientes";
import { ClienteForm } from "@/components/features/clientes/cliente-form";

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: cliente } = await buscarCliente(id);

  if (!cliente) notFound();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Editar Cliente</h1>
        <p className="text-sm text-gray-400 mt-1">Atualize os dados do responsável legal ou empresa.</p>
      </div>
      <ClienteForm cliente={cliente} />
    </div>
  );
}
