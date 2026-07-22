"use client";

/**
 * Desenho de seções de checklist (Sim/Não ou Sim/Não/NA) em tabela — reutilizado
 * pelos geradores de PDF dos Anexos de comissionamento/inspeção (IN 07, 09, 15
 * etc), que compartilham o mesmo formato: N seções, cada uma com uma lista de
 * itens numerados (ex: "1.1") e uma coluna de resposta.
 */

import type { jsPDF } from "jspdf";
import { MARGIN_TOP, MARGIN_LEFT, MARGIN_RIGHT, PAGE_WIDTH, PAGE_BREAK_Y } from "./pdf-branding";

export type DocWithAutoTable = jsPDF & {
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable: { finalY: number };
};

export interface ChecklistItemPdf {
  chave: string;
  texto: string;
}

export interface SecaoChecklistPdf {
  numero: string;
  titulo: string;
  itens: ChecklistItemPdf[];
}

const margin = MARGIN_LEFT;
const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

export function quebrarSeNecessario(doc: jsPDF, y: number, blockHeight = 0): number {
  if (y + blockHeight > PAGE_BREAK_Y) {
    doc.addPage();
    return MARGIN_TOP + 10;
  }
  return y;
}

function respostaTexto(v: string | undefined): string {
  return v === "sim" ? "SIM" : v === "nao" ? "NÃO" : v === "na" ? "NA" : "";
}

/** Desenha uma seção de checklist (título + tabela numero/item/resposta) e devolve o Y final. */
export function desenharSecaoChecklist(
  doc: DocWithAutoTable,
  y: number,
  secao: SecaoChecklistPdf,
  respostas: Record<string, string>,
  comNa = false
): number {
  let cursorY = quebrarSeNecessario(doc, y, 14 + secao.itens.length * 7);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`${secao.numero}. ${secao.titulo}`, margin, cursorY);
  cursorY += 3;

  const larguraResposta = comNa ? 28 : 22;
  const body = secao.itens.map((item) => [item.chave, item.texto, respostaTexto(respostas[item.chave])]);

  doc.autoTable({
    startY: cursorY,
    theme: "grid",
    head: [["Nº", "Item", "Resposta"]],
    body,
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold", halign: "center", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 1.8, textColor: 0, lineColor: 0, lineWidth: 0.2, valign: "middle" },
    columnStyles: {
      0: { cellWidth: 14, halign: "center" },
      1: { cellWidth: contentWidth - 14 - larguraResposta },
      2: { cellWidth: larguraResposta, halign: "center" },
    },
    margin: { left: margin, right: MARGIN_RIGHT },
  });

  return doc.lastAutoTable.finalY + 6;
}
