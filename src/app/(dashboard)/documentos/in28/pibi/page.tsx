import { listarPibis } from "@/app/actions/in28";
import { PibiList } from "@/components/features/in28/pibi-list";

export default async function PibisPage() {
  const { data: laudos } = await listarPibis();
  return <PibiList laudos={laudos} />;
}
