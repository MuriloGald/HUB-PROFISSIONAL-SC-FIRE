"use client";

/**
 * Gerador de PDF da IN 07 — Anexo C — Relatório de Comissionamento e de
 * Inspeção Periódica do Sistema de Hidrantes e Mangotinhos (SHP). Cabeçalho
 * oficial do CBMSC, sem identidade visual SC Fire.
 */

import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import { drawCabecalhoOficialCBMSC, desenharTabelaRotulos, MARGIN_TOP, MARGIN_LEFT, MARGIN_RIGHT, PAGE_WIDTH, PAGE_BREAK_Y } from "../shared/pdf-branding";
import { SECOES_SHP } from "./constants";
import type { ComissionamentoSHPState } from "./types";

applyPlugin(jsPDF);

type DocWithAutoTable = jsPDF & {
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable: { finalY: number };
};

const margin = MARGIN_LEFT;
const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

function quebrarSeNecessario(doc: DocWithAutoTable, y: number, blockHeight = 0): number {
  if (y + blockHeight > PAGE_BREAK_Y) {
    doc.addPage();
    return MARGIN_TOP + 10;
  }
  return y;
}

function respostaTexto(v: string | undefined): string {
  return v === "sim" ? "SIM" : v === "nao" ? "NÃO" : "";
}

function nomeArquivo(state: ComissionamentoSHPState): string {
  const nome = (state.cliente?.razao_social || "imovel").replace(/\s+/g, "_");
  return `Anexo_C_Comissionamento_SHP_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/** Gera o PDF do Anexo C (Relatório de Comissionamento do SHP, IN 07/CBMSC) e dispara o download. */
export async function gerarPdfComissionamentoSHP(state: ComissionamentoSHPState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoOficialCBMSC(doc, "ANEXO C — Relatório de Comissionamento e de Inspeção Periódica do Sistema de Hidrantes e Mangotinhos");

  y = desenharTabelaRotulos(doc, y, [
    [{ label: "Endereço", valor: `${state.endereco || ""}  Nº: ${state.numero || ""}  Complemento: ${state.complemento || ""}` }],
    [
      { label: "Bairro", valor: state.bairro || "" },
      { label: "Município-UF", valor: state.municipio_uf || "" },
    ],
    [
      { label: "RE", valor: state.re || "" },
      { label: "Ocupação e tipo", valor: state.ocupacao_tipo || "" },
    ],
    [
      { label: "Proprietário", valor: state.proprietario_nome || "" },
      { label: "E-mail", valor: state.proprietario_email || "" },
    ],
    [
      { label: "Responsável uso/brigadista", valor: state.responsavel_uso_nome || "" },
      { label: "E-mail", valor: state.responsavel_uso_email || "" },
    ],
    [
      { label: "Responsável Técnico pelo comissionamento/inspeção", valor: state.rt_nome || "" },
      { label: "Nº de registro", valor: state.rt_registro || "" },
    ],
    [{ label: "E-mail do RT", valor: state.rt_email || "" }],
  ]);
  y += 5;

  const respostas = state.respostas || {};

  for (const secao of SECOES_SHP) {
    y = quebrarSeNecessario(doc, y, 14 + secao.itens.length * 7);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${secao.numero}. ${secao.titulo}`, margin, y);
    y += 3;

    const body = secao.itens.map((item) => [item.chave, item.texto, respostaTexto(respostas[item.chave])]);

    doc.autoTable({
      startY: y,
      theme: "grid",
      head: [["Nº", "Item", "Sim/Não"]],
      body,
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold", halign: "center", fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 1.8, textColor: 0, lineColor: 0, lineWidth: 0.2, valign: "middle" },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: contentWidth - 12 - 22 },
        2: { cellWidth: 22, halign: "center" },
      },
      margin: { left: margin, right: MARGIN_RIGHT },
    });

    y = doc.lastAutoTable.finalY + 6;
  }

  y = quebrarSeNecessario(doc, y, 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `6.2 Teste de vazão — Qual o valor da vazão medida no hidrante menos favorável hidraulicamente?  Valor: ${state.vazao_medida || "___"} l/min`,
    margin,
    y,
    { maxWidth: contentWidth }
  );
  y += 10;

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFont("helvetica", "bold");
  doc.text("Justificativas técnicas para não atendimento dos itens assinalados", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const linhasJust = doc.splitTextToSize(state.justificativas || "-", contentWidth);
  doc.text(linhasJust, margin, y);
  y += linhasJust.length * 5 + 8;

  y = quebrarSeNecessario(doc, y, 40);
  doc.setFontSize(9);
  const textoAtesto =
    "Atesto, nesta data, que a instalação foi inspecionada e está em conformidade com as prescrições da IN 7, estando o proprietário e/ou o responsável pelo uso ciente(s) das responsabilidades referentes à manutenção e vistorias periódicas, conforme a NBR 13714.";
  const linhasAtesto = doc.splitTextToSize(textoAtesto, contentWidth);
  doc.text(linhasAtesto, margin, y);
  y += linhasAtesto.length * 5 + 8;

  const dataEmissao = state.data_emissao ? new Date(state.data_emissao).toLocaleDateString("pt-BR") : "";
  doc.text(`Data da comissionamento/inspeção: ${dataEmissao}`, margin, y);
  y += 15;
  doc.line(margin, y, margin + 100, y);
  y += 5;
  doc.text("Assinatura (Certificação digital) - Proprietário e/ou responsável pelo uso", margin, y);

  const fileName = nomeArquivo(state);
  doc.save(fileName);
  return fileName;
}
