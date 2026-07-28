import { listarEstagiosProcesso, listarProcessosSave23 } from "@/app/actions/save23-processos";
import { listarClientes } from "@/app/actions/clientes";
import { ProcessosKanban } from "@/components/features/save-in23/processos/processos-kanban";

export default async function Save23ProcessosPage() {
  const [{ data: estagios }, { data: processos }, { data: clientes }] = await Promise.all([
    listarEstagiosProcesso(),
    listarProcessosSave23(),
    listarClientes(),
  ]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Acompanhamento de Processos — SAVE 23</h1>
        <p className="text-sm text-gray-400 mt-1">
          Status de atendimento de cada condomínio, do contato inicial à dispensa. Arraste os cards entre as colunas e edite-as conforme o seu fluxo.
        </p>
      </div>

      <ProcessosKanban estagiosIniciais={estagios} processosIniciais={processos} clientes={clientes} />
    </div>
  );
}
