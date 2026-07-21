import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buscarRoteiro } from "@/app/actions/subtemas";
import { RoteiroForm } from "@/components/features/treinamentos/roteiro-form";

export default async function RoteiroSubtemaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await buscarRoteiro(id);

  if (error || !data) notFound();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link href="/treinamentos/subtemas" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos subtemas
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Roteiro de Aula</h1>
        <p className="text-sm text-gray-400 mt-1">{data.name}</p>
      </div>

      <RoteiroForm subtemaId={id} subtemaNome={data.name} conteudoExistente={data.conteudo} />
    </div>
  );
}
