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
import {
  drawCabecalhoInstitucional,
  desenharTabelaRotulos,
  MARGIN_TOP,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  PAGE_WIDTH,
  PAGE_BREAK_Y,
} from "../shared/pdf-branding";
import { agruparPorDia, rotuloDia } from "./formatters";
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

/**
 * Normaliza quebras de linha do texto vindo do textarea antes de medir/desenhar —
 * sem isso, colar conteudo com varias linhas em branco seguidas (Word, PDF, etc.)
 * infla `linhas.length` desnecessariamente.
 */
function normalizarQuebras(texto: string): string {
  return texto.replace(/\r\n?/g, "\n").replace(/\n{2,}/g, "\n\n").trim();
}

/**
 * `doc.getLineHeight()` retorna `activeFontSize * lineHeightFactor` em PONTOS,
 * nao na unidade do documento (mm) — precisa dividir por `internal.scaleFactor`
 * pra converter (ver node_modules/jspdf: getLineHeight() nao faz essa conversao,
 * so quem chama por fora, tipo API.getTextDimensions, e que divide). Usar o
 * valor bruto em pontos como se fosse mm faz o cursor avancar ~2.83x mais do
 * que o texto realmente ocupa — num paragrafo de 20 linhas isso sozinho abre
 * mais de 130mm de vao vazio antes da proxima secao.
 */
function alturaLinha(doc: DocWithAutoTable): number {
  return doc.getLineHeight() / doc.internal.scaleFactor;
}

function drawTexto(doc: DocWithAutoTable, y: number, texto: string): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const linhas: string[] = doc.splitTextToSize(normalizarQuebras(texto) || "—", contentWidth);
  doc.text(linhas, margin, y);
  return y + linhas.length * alturaLinha(doc) + 6;
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
    cursorY += linhas.length * alturaLinha(doc);
  }
  return cursorY + 6;
}

/**
 * Decide onde uma tabela deve comecar: se ela nao cabe inteira daqui ate o fim
 * da pagina mas cabe inteira numa pagina nova, pula a pagina toda — em vez de
 * deixar so as primeiras linhas "penduradas" aqui e o resto continuando depois.
 * Se nem numa pagina nova ela cabe inteira (tabela grande demais), so segue
 * daqui mesmo e deixa o autoTable paginar normalmente (inevitavel).
 */
function posicionarParaTabela(doc: DocWithAutoTable, y: number, alturaEstimada: number): number {
  const cabeAqui = y + alturaEstimada <= PAGE_BREAK_Y;
  const cabeNumaPaginaNova = alturaEstimada <= PAGE_BREAK_Y - (MARGIN_TOP + 10);
  if (!cabeAqui && cabeNumaPaginaNova) {
    doc.addPage();
    return MARGIN_TOP + 10;
  }
  return y;
}

function drawIdentificacao(doc: DocWithAutoTable, y: number, state: PlanoEnsinoWizardState): number {
  const posicaoInicial = posicionarParaTabela(doc, y, 10 + 4 * 8);
  const startY = drawSecaoTitulo(doc, posicaoInicial, "1. IDENTIFICAÇÃO");

  const finalY = desenharTabelaRotulos(doc, startY + 3, [
    [{ label: "Curso/Matéria", valor: state.training?.name || "" }],
    [
      { label: "Carga Horária", valor: state.training?.total_hours != null ? `${state.training.total_hours}h` : "" },
      { label: "Turma/Período", valor: state.turma_periodo || "" },
    ],
    [{ label: "Instrutor Responsável", valor: state.instrutor_responsavel || "" }],
  ]);

  return finalY + 8;
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
  const linhas = state.conteudo_programatico || [];
  const grupos = agruparPorDia(linhas, state.datas_dias);

  // +1 linha de cabecalho da tabela, +1 linha "Dia N" por grupo, +1 linha por topico
  const numLinhas = linhas.length === 0 ? 1 : linhas.length + grupos.length;
  const alturaEstimada = 10 /* titulo */ + (numLinhas + 1) * 8;
  const posicaoInicial = posicionarParaTabela(doc, y, alturaEstimada);

  const startY = drawSecaoTitulo(doc, posicaoInicial, "4. CONTEÚDO PROGRAMÁTICO");

  const body: RowInput[] = [];
  if (linhas.length === 0) {
    body.push(["—", "—"]);
  } else {
    for (const { dia, itens, cargaDia, data } of grupos) {
      body.push([
        { content: rotuloDia(dia, data), styles: { fillColor: [240, 240, 240], fontStyle: "bold" } },
        { content: `${cargaDia}h`, styles: { fillColor: [240, 240, 240], fontStyle: "bold", halign: "center" } },
      ]);
      itens.forEach((l) => body.push([l.nome, `${l.horas}h`]));
    }
  }

  doc.autoTable({
    startY: startY + 3,
    theme: "grid",
    head: [["Tópico", "Carga Horária"]],
    body,
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold", halign: "center", fontSize: 8, cellPadding: 2 },
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
  if (cursorY > PAGE_BREAK_Y - 32) {
    doc.addPage();
    cursorY = MARGIN_TOP + 10;
  }
  cursorY += 14;

  const dataEmissao = new Date(state.data_emissao || Date.now());
  const dataFormatada = dataEmissao.toLocaleDateString("pt-BR");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`São José/SC, ${dataFormatada}`, margin, cursorY);
  cursorY += 12;

  doc.setDrawColor(0, 0, 0);
  doc.line(margin, cursorY, margin + 80, cursorY);
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
