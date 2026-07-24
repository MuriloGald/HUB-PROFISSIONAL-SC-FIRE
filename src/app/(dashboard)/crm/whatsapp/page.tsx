import { listInstances } from "@/app/actions/crm-whatsapp";
import { WhatsappInstances } from "@/components/features/crm/whatsapp-instances";

export default async function WhatsappPage() {
  const { data: instances } = await listInstances();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">WhatsApp</h1>
        <p className="text-sm text-gray-400 mt-1">
          Instâncias conectadas ao agente — só o diretor cadastra e conecta.
        </p>
      </div>

      <WhatsappInstances instanciasIniciais={instances} />
    </div>
  );
}
