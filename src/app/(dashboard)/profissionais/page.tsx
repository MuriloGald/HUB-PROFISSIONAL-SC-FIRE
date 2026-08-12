import { listarProfissionais } from "@/app/actions/profissionais";
import { ProfissionaisList } from "@/components/features/profissionais/profissionais-list";

export default async function ProfissionaisPage() {
  const { data: profissionais } = await listarProfissionais();

  return <ProfissionaisList profissionais={profissionais} />;
}
