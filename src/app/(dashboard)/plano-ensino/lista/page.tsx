import { listarPlanosEnsino } from "@/app/actions/plano-ensino";
import { PlanosList } from "@/components/features/plano-ensino/planos-list";

export default async function ConsultaPlanosEnsinoPage() {
  const { data: planos } = await listarPlanosEnsino();

  return <PlanosList planos={planos} />;
}
