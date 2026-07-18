import { listarTermosHabitese } from "@/app/actions/habitese";
import { TermosList } from "@/components/features/habitese/termos-list";

export default async function ConsultaTermosHabitesePage() {
  const { data: laudos } = await listarTermosHabitese();

  return <TermosList laudos={laudos} />;
}
