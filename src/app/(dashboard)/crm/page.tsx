import { listarLeads } from "@/app/actions/crm";
import { listarClientes } from "@/app/actions/clientes";
import { CrmKanban } from "@/components/features/crm/crm-kanban";

export default async function CrmPage() {
  const [{ data: leads }, { data: clientes }] = await Promise.all([listarLeads(), listarClientes()]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">CRM — Funil de Vendas</h1>
        <p className="text-sm text-gray-400 mt-1">Arraste os cards entre os estágios pra acompanhar cada oportunidade.</p>
      </div>

      <CrmKanban leadsIniciais={leads} clientes={clientes} />
    </div>
  );
}
