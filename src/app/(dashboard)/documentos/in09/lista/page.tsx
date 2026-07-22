import { listarComissionamentosElevador } from "@/app/actions/in09";
import { ElevadorList } from "@/components/features/in09/elevador-list";

export default async function ComissionamentosElevadorPage() {
  const { data: laudos } = await listarComissionamentosElevador();
  return <ElevadorList laudos={laudos} />;
}
