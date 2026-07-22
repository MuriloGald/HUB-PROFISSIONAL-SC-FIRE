import { listarControlesFumaca } from "@/app/actions/in10";
import { FumacaList } from "@/components/features/in10/fumaca-list";

export default async function ControlesFumacaPage() {
  const { data: laudos } = await listarControlesFumaca();
  return <FumacaList laudos={laudos} />;
}
