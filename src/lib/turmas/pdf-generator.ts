"use client";

/**
 * Gerador de PDF do Relatório da Turma — curso aplicado, com os gráficos da
 * Pesquisa de Satisfação e o resultado da Avaliação de Aprendizagem, usando
 * jsPDF + jsPDF-AutoTable (mesmo motor dos demais geradores do hub) e a
 * identidade visual institucional (src/lib/shared/pdf-branding.ts).
 *
 * Sem lib de gráfico externa: as barras são desenhadas na mão com
 * doc.rect(), no mesmo espírito de desenharTabelaRotulos — consistente com o
 * resto do hub, que não depende de canvas/chart.js pra gerar PDF no cliente.
 */

import { jsPDF } from "jspdf";
import { applyPlugin, type RowInput } from "jspdf-autotable";
import {
  drawCabecalhoInstitucional,
  desenharTabelaRotulos,
  COR_VERMELHO_ESCURO,
  MARGIN_TOP,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  PAGE_WIDTH,
  PAGE_BREAK_Y,
} from "../shared/pdf-branding";
import { formatarDataBR } from "../shared/date-format";
import type { RelatorioTurmaData } from "./relatorio-types";

applyPlugin(jsPDF);

type DocWithAutoTable = jsPDF & {
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable: { finalY: number };
};

const margin = MARGIN_LEFT;
const pageWidth = PAGE_WIDTH;
const contentWidth = pageWidth - MARGIN_LEFT - MARGIN_RIGHT;

const COR_TRILHO: [number, number, number] = [230, 230, 230];
const COR_TEXTO_SUAVE: [number, number, number] = [100, 116, 139];

function quebrarSeNecessario(doc: DocWithAutoTable, y: number, alturaNecessaria = 0): number {
  if (y + alturaNecessaria > PAGE_BREAK_Y) {
    doc.addPage();
    return MARGIN_TOP + 10;
  }
  return y;
}

function drawSecaoTitulo(doc: DocWithAutoTable, y: number, texto: string): number {
  const startY = quebrarSeNecessario(doc, y, 10);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(texto, margin, startY);
  return startY;
}

/** Barra horizontal simples (trilho cinza + preenchimento vermelho institucional) com rótulo à esquerda e valor à direita. */
function drawBarraHorizontal(doc: DocWithAutoTable, y: number, rotulo: string, valor: number, max: number, sufixoValor: string): number {
  const rotuloWidth = 62;
  const valorWidth = 20;
  const barraX = margin + rotuloWidth;
  const barraWidth = contentWidth - rotuloWidth - valorWidth;
  const barraHeight = 4.5;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const linhasRotulo: string[] = doc.splitTextToSize(rotulo, rotuloWidth - 3);
  doc.text(linhasRotulo, margin, y + barraHeight - 0.5);

  doc.setFillColor(...COR_TRILHO);
  doc.roundedRect(barraX, y, barraWidth, barraHeight, 1, 1, "F");

  const proporcao = max > 0 ? Math.max(0, Math.min(1, valor / max)) : 0;
  if (proporcao > 0) {
    doc.setFillColor(...COR_VERMELHO_ESCURO);
    doc.roundedRect(barraX, y, barraWidth * proporcao, barraHeight, 1, 1, "F");
  }

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(sufixoValor, barraX + barraWidth + 4, y + barraHeight - 0.5);

  return y + Math.max(barraHeight, linhasRotulo.length * 4) + 4;
}

function drawIdentificacao(doc: DocWithAutoTable, y: number, data: RelatorioTurmaData): number {
  const { identificacao, avaliacao } = data;
  const startY = drawSecaoTitulo(doc, y, "1. IDENTIFICAÇÃO");

  const finalY = desenharTabelaRotulos(doc, startY + 3, [
    [{ label: "Curso", valor: identificacao.trainingName || "" }],
    [
      { label: "Carga Horária", valor: identificacao.totalHours != null ? `${identificacao.totalHours}h` : "" },
      { label: "Data", valor: formatarDataBR(identificacao.finishedAt || identificacao.scheduledAt) || "" },
    ],
    [
      { label: "Cliente", valor: identificacao.clienteNome || "—" },
      { label: "Instrutor", valor: identificacao.instrutorNome || "—" },
    ],
    [{ label: "Total de Alunos Presentes", valor: String(avaliacao.totalPresentes) }],
  ]);

  return finalY + 8;
}

function drawAvaliacao(doc: DocWithAutoTable, y: number, data: RelatorioTurmaData): number {
  const { avaliacao } = data;
  const startY = drawSecaoTitulo(doc, y, "2. AVALIAÇÃO DE APRENDIZAGEM");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_TEXTO_SUAVE);
  const resumo = `${avaliacao.totalRespostas} de ${avaliacao.totalPresentes} aluno(s) presente(s) concluíram a avaliação de verificação.`;
  doc.text(resumo, margin, startY + 6);
  doc.setTextColor(0, 0, 0);

  if (avaliacao.totalRespostas === 0) {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COR_TEXTO_SUAVE);
    doc.text("Nenhuma avaliação respondida até o momento.", margin, startY + 14);
    doc.setTextColor(0, 0, 0);
    return startY + 20;
  }

  const cursorY = drawBarraHorizontal(
    doc,
    startY + 12,
    "Média de acertos",
    avaliacao.mediaAcertosPercent,
    100,
    `${avaliacao.mediaAcertosPercent.toFixed(0)}%`
  );

  return cursorY + 4;
}

function drawPesquisaSatisfacao(doc: DocWithAutoTable, y: number, data: RelatorioTurmaData): number {
  const { satisfacao } = data;
  const alturaEstimada = 10 + 8 + satisfacao.perguntas.length * 9;
  let cursorY = quebrarSeNecessario(doc, y, Math.min(alturaEstimada, PAGE_BREAK_Y - MARGIN_TOP - 10));
  cursorY = drawSecaoTitulo(doc, cursorY, "3. PESQUISA DE SATISFAÇÃO");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_TEXTO_SUAVE);
  doc.text(
    `${satisfacao.totalRespostas} de ${satisfacao.totalPresentes} aluno(s) presente(s) responderam a pesquisa.`,
    margin,
    cursorY + 6
  );
  doc.setTextColor(0, 0, 0);
  cursorY += 12;

  if (satisfacao.totalRespostas === 0) {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COR_TEXTO_SUAVE);
    doc.text("Nenhuma pesquisa de satisfação respondida até o momento.", margin, cursorY);
    doc.setTextColor(0, 0, 0);
    return cursorY + 8;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Satisfação Geral: ${satisfacao.mediaGeral.toFixed(1)} / 5`, margin, cursorY);
  cursorY += 8;

  for (const p of satisfacao.perguntas) {
    cursorY = quebrarSeNecessario(doc, cursorY, 10);
    cursorY = drawBarraHorizontal(doc, cursorY, p.pergunta, p.media, 5, `${p.media.toFixed(1)}/5`);
  }
  cursorY += 4;

  // Tabela de distribuição das notas (quantas notas 1★..5★ cada pergunta recebeu).
  const alturaTabela = 10 + (satisfacao.perguntas.length + 1) * 8;
  cursorY = quebrarSeNecessario(doc, cursorY, Math.min(alturaTabela, PAGE_BREAK_Y - MARGIN_TOP - 10));

  const body: RowInput[] = satisfacao.perguntas.map((p) => [
    p.pergunta,
    ...p.distribuicao.map((qtd) => String(qtd)),
  ]);

  doc.autoTable({
    startY: cursorY,
    theme: "grid",
    head: [["Pergunta", "1★", "2★", "3★", "4★", "5★"]],
    body,
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold", halign: "center", fontSize: 8, cellPadding: 2 },
    styles: { fontSize: 8, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.2 },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.6 },
      1: { cellWidth: contentWidth * 0.08, halign: "center" },
      2: { cellWidth: contentWidth * 0.08, halign: "center" },
      3: { cellWidth: contentWidth * 0.08, halign: "center" },
      4: { cellWidth: contentWidth * 0.08, halign: "center" },
      5: { cellWidth: contentWidth * 0.08, halign: "center" },
    },
    margin: { left: margin, right: MARGIN_RIGHT },
  });

  return doc.lastAutoTable.finalY + 8;
}

function drawComentarios(doc: DocWithAutoTable, y: number, data: RelatorioTurmaData): void {
  const { comentarios } = data.satisfacao;
  const startY = drawSecaoTitulo(doc, y, "4. COMENTÁRIOS DOS ALUNOS");
  let cursorY = startY + 6;

  if (comentarios.length === 0) {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COR_TEXTO_SUAVE);
    doc.text("Nenhum comentário registrado.", margin, cursorY);
    doc.setTextColor(0, 0, 0);
    return;
  }

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  for (const comentario of comentarios) {
    cursorY = quebrarSeNecessario(doc, cursorY, 8);
    const linhas: string[] = doc.splitTextToSize(`•  ${comentario}`, contentWidth);
    doc.text(linhas, margin, cursorY);
    cursorY += linhas.length * 4.6 + 3;
  }
}

function nomeArquivo(data: RelatorioTurmaData): string {
  const nome = (data.identificacao.trainingName || "curso").replace(/\s+/g, "_");
  const data_ = (data.identificacao.finishedAt || data.identificacao.scheduledAt || "").slice(0, 10) || "sem_data";
  return `Relatorio_Turma_${nome}_${data_}.pdf`;
}

/** Gera o PDF do Relatório da Turma e dispara o download no navegador. Retorna o nome do arquivo gerado. */
export async function gerarPdfRelatorioTurma(data: RelatorioTurmaData): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoInstitucional(doc, "Relatório da Turma — Curso Aplicado", data.identificacao.trainingName || "");
  y = drawIdentificacao(doc, y, data);
  y = drawAvaliacao(doc, y, data);
  y = drawPesquisaSatisfacao(doc, y, data);
  drawComentarios(doc, y, data);

  const fileName = nomeArquivo(data);
  doc.save(fileName);
  return fileName;
}
