"use client";

/**
 * Gerador de PDF do modulo Plano de Ensino — Programa de Materia, usando
 * jsPDF + jsPDF-AutoTable (mesmo motor dos demais geradores do hub).
 *
 * Documento pedagogico interno, sem formulario oficial externo a espelhar
 * (diferente do Anexo B/C/D/E do IN 24) — por isso so existe uma via, sempre
 * com a identidade visual da SC Fire, no mesmo espirito do gerador de Habite-se.
 */

import { jsPDF } from "jspdf";
import { applyPlugin, type RowInput } from "jspdf-autotable";
import { drawCabecalhoInstitucional, MARGIN_TOP, MARGIN_LEFT, MARGIN_RIGHT, PAGE_WIDTH, PAGE_BREAK_Y } from "../shared/pdf-branding";
import type { PlanoEnsinoWizardState } from "./types";

applyPlugin(jsPDF);

type DocWithAutoTable = jsPDF & {
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable: { finalY: number };
};

const margin = MARGIN_LEFT;
const pageWidth = PAGE_WIDTH;
const contentWidth = pageWidth - MARGIN_LEFT - MARGIN_RIGHT;

function quebrarSeNecessario(doc: DocWithAutoTable, y: number): number {
  if (y > PAGE_BREAK_Y) {
    doc.addPage();
    return MARGIN_TOP + 10;
  }
  return y;
}

function drawSecaoTitulo(doc: DocWithAutoTable, y: number, texto: string): number {
  const startY = quebrarSeNecessario(doc, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(texto, margin, startY);
  return startY;
}

function drawTexto(doc: DocWithAutoTable, y: number, texto: string): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const linhas: string[] = doc.splitTextToSize(texto || "—", contentWidth);
  doc.text(linhas, margin, y);
  return y + linhas.length * 5 + 6;
}

function drawLista(doc: DocWithAutoTable, y: number, itens: string[]): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  let cursorY = y;
  const lista = itens.length > 0 ? itens : ["—"];
  for (const item of lista) {
    cursorY = quebrarSeNecessario(doc, cursorY);
    const linhas: string[] = doc.splitTextToSize(`•  ${item}`, contentWidth);
    doc.text(linhas, margin, cursorY);
    cursorY += linhas.length * 5;
  }
  return cursorY + 6;
}

function drawIdentificacao(doc: DocWithAutoTable, y: number, state: PlanoEnsinoWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "1. IDENTIFICAÇÃO");

  const body: RowInput[] = [
    [{ content: `Curso/Matéria: ${state.training?.name || ""}`, colSpan: 2 }],
    [`Carga Horária: ${state.training?.total_hours ?? ""}h`, `Turma/Período: ${state.turma_periodo || ""}`],
    [{ content: `Instrutor Responsável: ${state.instrutor_responsavel || ""}`, colSpan: 2 }],
  ];

  doc.autoTable({
    startY: startY + 3,
    theme: "grid",
    head: [],
    body,
    styles: { fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth / 2 }, 1: { cellWidth: contentWidth / 2 } },
    margin: { left: margin, right: MARGIN_RIGHT },
  });

  return doc.lastAutoTable.finalY + 8;
}

function drawEmenta(doc: DocWithAutoTable, y: number, state: PlanoEnsinoWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "2. EMENTA");
  return drawTexto(doc, startY + 6, state.ementa || "");
}

function drawObjetivos(doc: DocWithAutoTable, y: number, state: PlanoEnsinoWizardState): number {
  let cursorY = drawSecaoTitulo(doc, y, "3. OBJETIVOS");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  cursorY += 6;
  doc.text("Objetivo Geral", margin, cursorY);
  cursorY = drawTexto(doc, cursorY + 5, state.objetivo_geral || "");

  cursorY = quebrarSeNecessario(doc, cursorY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Objetivos Específicos", margin, cursorY);
  cursorY = drawLista(doc, cursorY + 5, state.objetivos_especificos || []);

  return cursorY;
}

function drawConteudoProgramatico(doc: DocWithAutoTable, y: number, state: PlanoEnsinoWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "4. CONTEÚDO PROGRAMÁTICO");

  const linhas = state.conteudo_programatico || [];
  const head = [["Tópico", "Carga Horária"]];
  const body: RowInput[] =
    linhas.length > 0
      ? linhas.map((l) => [l.nome, `${l.horas}h`])
      : [["—", "—"]];

  doc.autoTable({
    startY: startY + 3,
    theme: "grid",
    head,
    body,
    headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold", halign: "center", fontSize: 8, cellPadding: 2 },
    styles: { fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth * 0.75 }, 1: { cellWidth: contentWidth * 0.25, halign: "center" } },
    margin: { left: margin, right: MARGIN_RIGHT },
  });

  return doc.lastAutoTable.finalY + 8;
}

function drawMetodologia(doc: DocWithAutoTable, y: number, state: PlanoEnsinoWizardState): number {
  let cursorY = drawSecaoTitulo(doc, y, "5. METODOLOGIA DE ENSINO");
  cursorY = drawTexto(doc, cursorY + 6, state.metodologia || "");

  cursorY = drawSecaoTitulo(doc, cursorY, "6. RECURSOS DIDÁTICOS");
  cursorY = drawTexto(doc, cursorY + 6, state.recursos_didaticos || "");

  return cursorY;
}

function drawAvaliacao(doc: DocWithAutoTable, y: number, state: PlanoEnsinoWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "7. CRITÉRIOS DE AVALIAÇÃO");
  return drawTexto(doc, startY + 6, state.criterios_avaliacao || "");
}

function drawBibliografia(doc: DocWithAutoTable, y: number, state: PlanoEnsinoWizardState): number {
  let cursorY = drawSecaoTitulo(doc, y, "8. BIBLIOGRAFIA");

  cursorY += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Básica", margin, cursorY);
  cursorY = drawLista(doc, cursorY + 5, state.bibliografia_basica || []);

  cursorY = quebrarSeNecessario(doc, cursorY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Complementar", margin, cursorY);
  cursorY = drawLista(doc, cursorY + 5, state.bibliografia_complementar || []);

  return cursorY;
}

function drawAssinatura(doc: DocWithAutoTable, y: number, state: PlanoEnsinoWizardState): void {
  let cursorY = y;
  if (cursorY > PAGE_BREAK_Y - 25) {
    doc.addPage();
    cursorY = MARGIN_TOP + 10;
  }
  cursorY += 20;

  doc.setDrawColor(0, 0, 0);
  doc.line(margin, cursorY, margin + 80, cursorY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Assinatura do Instrutor / Responsável Pedagógico", margin, cursorY + 5);
  doc.text(state.instrutor_responsavel || "", margin, cursorY + 10);
}

function nomeArquivo(state: PlanoEnsinoWizardState): string {
  const nome = (state.training?.name || "curso").replace(/\s+/g, "_");
  return `Plano_de_Ensino_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/** Gera o PDF do Plano de Ensino e dispara o download no navegador. Retorna o nome do arquivo gerado. */
export async function gerarPdfPlanoEnsino(state: PlanoEnsinoWizardState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoInstitucional(doc, "Programa de Matéria — Plano de Ensino", state.training?.name || "", state.codigo);
  y = drawIdentificacao(doc, y, state);
  y = drawEmenta(doc, y, state);
  y = drawObjetivos(doc, y, state);
  y = drawConteudoProgramatico(doc, y, state);
  y = drawMetodologia(doc, y, state);
  y = drawAvaliacao(doc, y, state);
  y = drawBibliografia(doc, y, state);
  drawAssinatura(doc, y, state);

  const fileName = nomeArquivo(state);
  doc.save(fileName);
  return fileName;
}
