import { notFound } from "next/navigation";
import { buscarTurmaParaCockpit } from "@/app/actions/turmas";
import { listarAulasDoCurso } from "@/app/actions/treinador";
import { CockpitInstrutor } from "@/components/features/treinador/cockpit-instrutor";
import { SalaDeEspera } from "@/components/features/turmas/sala-de-espera";

export default async function TurmaCockpitPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const { data, error } = await buscarTurmaParaCockpit(classId);

  if (error || !data || !data.curso) notFound();

  const { turma, curso, clienteNome } = data;

  if (turma.status !== "em_andamento" && turma.status !== "agendada") notFound();

  const { data: aulas } = await listarAulasDoCurso(curso.id);

  if (turma.status === "agendada") {
    return <SalaDeEspera classId={classId} cursoNome={curso.name} clienteNome={clienteNome} instrutorNome={turma.instrutor_nome} totalAulas={aulas.length} />;
  }

  return <CockpitInstrutor curso={curso} aulas={aulas} turma={{ id: turma.id, qrCodeToken: turma.qr_code_token, clienteNome }} />;
}
