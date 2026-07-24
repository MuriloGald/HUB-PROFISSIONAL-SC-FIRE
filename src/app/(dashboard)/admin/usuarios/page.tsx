import { listarUsuarios } from "@/app/actions/usuarios";
import { UsuariosTable } from "@/components/features/admin/usuarios-table";

export default async function UsuariosPage() {
  const { data: usuarios, error } = await listarUsuarios();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Usuários</h1>
        <p className="text-sm text-gray-400 mt-1">
          Diretor edita e configura tudo; administrador só usa o CRM; professor só acessa o Treinador.
        </p>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : <UsuariosTable usuariosIniciais={usuarios} />}
    </div>
  );
}
