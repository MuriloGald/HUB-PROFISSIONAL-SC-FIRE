import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClienteForm } from "@/components/features/save-in23/cliente-form";
import type { Cliente } from "@/lib/supabase/types";

export default async function EditarClienteSave23Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cliente } = await supabase.from("clientes").select("*").eq("id", id).single();

  if (!cliente) notFound();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Editar Edificação</h1>
        <p className="text-sm text-gray-400 mt-1">Atualize os dados da edificação com SAVE (IN 23).</p>
      </div>
      <ClienteForm cliente={cliente as Cliente} />
    </div>
  );
}
