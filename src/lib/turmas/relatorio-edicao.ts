import type { RelatorioTurmaData, RelatorioTurmaEdicao } from "./relatorio-types";

/** Aplica a edição manual salva sobre os dados calculados do relatório. */
export function aplicarEdicaoRelatorio(base: RelatorioTurmaData, edicao: RelatorioTurmaEdicao | null | undefined): RelatorioTurmaData {
  if (!edicao || Object.keys(edicao).length === 0) return base;
  const e = edicao;
  const totalPresentes = e.totalPresentes ?? base.avaliacao.totalPresentes;

  // Percentual editado numa prova sem nenhuma resposta: marca 1 resposta para
  // a barra aparecer no PDF/.docx (os geradores escondem provas sem resposta).
  const fase = (atual: RelatorioTurmaData["avaliacao"]["incendio"], percent: number | undefined) =>
    percent === undefined ? atual : { totalRespostas: Math.max(1, atual.totalRespostas), mediaAcertosPercent: percent };

  return {
    ...base,
    identificacao: {
      ...base.identificacao,
      trainingName: e.trainingName ?? base.identificacao.trainingName,
      totalHours: e.totalHours !== undefined ? e.totalHours : base.identificacao.totalHours,
      clienteNome: e.clienteNome !== undefined ? e.clienteNome : base.identificacao.clienteNome,
      instrutorNome: e.instrutorNome !== undefined ? e.instrutorNome : base.identificacao.instrutorNome,
      scheduledAt: e.dataTreinamento !== undefined ? e.dataTreinamento : base.identificacao.scheduledAt,
    },
    avaliacao: {
      ...base.avaliacao,
      totalPresentes,
      incendio: fase(base.avaliacao.incendio, e.incendioPercent),
      socorros: fase(base.avaliacao.socorros, e.socorrosPercent),
      mediaGeralPercent: e.mediaGeralPercent ?? base.avaliacao.mediaGeralPercent,
    },
    satisfacao: {
      ...base.satisfacao,
      totalPresentes,
      comentarios: e.comentarios ?? base.satisfacao.comentarios,
    },
    observacoes: e.observacoes?.trim() ? e.observacoes.trim() : undefined,
    editado: true,
  };
}
