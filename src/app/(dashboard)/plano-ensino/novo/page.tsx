import { listarTrainings, buscarPlanoEnsino } from "@/app/actions/plano-ensino";
import { PlanoEnsinoWizard } from "@/components/features/plano-ensino/wizard/plano-ensino-wizard";
import type { PlanoEnsinoWizardState } from "@/lib/plano-ensino/types";

export default async function NovoPlanoEnsinoPage({
  searchParams,
}: {
  searchParams: Promise<{ editarId?: string }>;
}) {
  const { editarId } = await searchParams;
  const { data: trainings } = await listarTrainings();

  let initialState: PlanoEnsinoWizardState | undefined;
  if (editarId) {
    const { data: laudo } = await buscarPlanoEnsino(editarId);
    if (laudo) {
      initialState = { ...(laudo.dados as PlanoEnsinoWizardState), laudoId: laudo.id, step: 5 };
    }
  }

  return <PlanoEnsinoWizard trainings={trainings} initialState={initialState} />;
}
