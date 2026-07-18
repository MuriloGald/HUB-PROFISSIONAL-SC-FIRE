import { listarVistorias } from "@/app/actions/save-in23";
import { VistoriasList } from "@/components/features/save-in23/vistoria/vistorias-list";

export default async function VistoriasPage() {
  const { data: laudos } = await listarVistorias();

  return <VistoriasList laudos={laudos} />;
}
