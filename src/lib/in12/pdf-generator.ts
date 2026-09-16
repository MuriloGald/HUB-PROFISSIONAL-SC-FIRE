"use client";

import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import {
  drawCabecalhoInstitucional,
  drawCabecalhoOficialCBMSC,
  desenharTabelaRotulos,
  formatarRegistroProfissional,
  MARGIN_TOP,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  PAGE_WIDTH,
  PAGE_BREAK_Y,
} from "../shared/pdf-branding";
import { formatarDataBR } from "../shared/date-format";
import { REQUISITOS_IN12, TEXTO_ATESTADO_PADRAO } from "./constants";
import type { AlarmeIn12State } from "./types";

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

function resolverRt(state: AlarmeIn12State): { nome: string; registro: string; contato: string } {
  if (state.rt) {
    return {
      nome: state.rt.nome,
      registro: formatarRegistroProfissional({
        nome: state.rt.nome,
        registroTipo: state.rt.registro_tipo,
        registroNumero: state.rt.registro_numero,
      }),
      contato: [state.rt.email, state.rt.telefone].filter(Boolean).join(" "),
    };
  }
  return {
    nome: state.rt_nome ?? "",
    registro: state.rt_registro ?? "",
    contato: `${state.rt_email || ""} ${state.rt_fone || ""}`.trim(),
  };
}

function desenharIdentificacao(doc: DocWithAutoTable, startY: number, state: AlarmeIn12State): number {
  const rt = resolverRt(state);
  const logradouroComp = [state.logradouro || state.endereco, state.numero ? `N.º ${state.numero}` : "", state.complemento]
    .filter(Boolean)
    .join(", ");

  return desenharTabelaRotulos(doc, startY, [
    [{ label: "Edificação", valor: state.edificacao || state.cliente?.razao_social || "" }],
    [{ label: "Logradouro público", valor: logradouroComp }],
    [
      { label: "Bairro", valor: state.bairro || "" },
      { label: "Município/UF", valor: state.municipio_uf || state.cidade || "" },
      { label: "CEP", valor: state.cep || "" },
    ],
    [
      { label: "Proprietário", valor: state.proprietario_nome || "" },
      { label: "E-mail / Fone", valor: [state.proprietario_email, state.proprietario_fone].filter(Boolean).join(" | ") },
    ],
    [
      { label: "Responsável pelo uso", valor: state.responsavel_uso_nome || "" },
      { label: "E-mail / Fone", valor: [state.responsavel_uso_email, state.responsavel_uso_fone].filter(Boolean).join(" | ") },
    ],
    [
      { label: "Responsável Técnico", valor: rt.nome },
      { label: "Registro Profissional", valor: rt.registro },
    ],
    [{ label: "Contato do RT", valor: rt.contato }],
    [
      { label: "Ocupação - Destinação", valor: state.ocupacao_destinacao || "" },
      { label: "Classificação (uso)", valor: state.classificacao_uso || "" },
    ],
    [
      { label: "Altura da edificação", valor: state.altura_edificacao || "" },
      { label: "Idade do imóvel", valor: state.idade_imovel || "" },
    ],
    [
      { label: "Pessoa de contato", valor: state.contato_nome || "" },
      { label: "Fone de contato", valor: state.contato_fone || "" },
    ],
  ]);
}

function desenharChecklist(doc: DocWithAutoTable, startY: number, state: AlarmeIn12State): number {
  let y = quebrarSeNecessario(doc, startY, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("O responsável pelo fornecimento deste atestado deve preencher todos os campos da tabela a seguir:", margin, y);
  y += 4;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text('"C" = CONFORME / "NA" = NÃO APLICÁVEL / "NC" = NÃO CONFORME', margin, y);
  y += 5;

  const respostas = state.respostas || {};

  const body = REQUISITOS_IN12.map((req) => {
    const itemResp = respostas[req.item];
    const resp = itemResp?.resposta || "";
    const obs = itemResp?.observacao || "";
    return [
      req.item,
      req.descricao,
      resp === "C" ? "X" : "",
      resp === "NA" ? "X" : "",
      resp === "NC" ? "X" : "",
      obs,
    ];
  });

  doc.autoTable({
    startY: y,
    theme: "grid",
    head: [["Item NBR 17240", "Requisitos", "C", "NA", "NC", "Observação"]],
    body,
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: 0,
      fontStyle: "bold",
      halign: "center",
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      textColor: 0,
      lineColor: [180, 180, 180],
      lineWidth: 0.2,
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      1: { cellWidth: contentWidth - 22 - 9 - 9 - 9 - 30 },
      2: { cellWidth: 9, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 9, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 9, halign: "center", fontStyle: "bold" },
      5: { cellWidth: 30 },
    },
    margin: { left: margin, right: MARGIN_RIGHT },
  });

  return doc.lastAutoTable.finalY + 6;
}

function desenharAvaliacaoEAssinaturas(doc: DocWithAutoTable, startY: number, state: AlarmeIn12State): void {
  let y = quebrarSeNecessario(doc, startY, 50);
  const rt = resolverRt(state);

  if (state.observacoes_gerais) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Obs.:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const linhasObs = doc.splitTextToSize(state.observacoes_gerais, contentWidth);
    doc.text(linhasObs, margin, y);
    y += linhasObs.length * 4.5 + 8;
  }

  y = quebrarSeNecessario(doc, y, 45);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Avaliação geral do sistema de detecção e alarme de incêndio:", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const textoAtesto = state.texto_atestado || TEXTO_ATESTADO_PADRAO;
  const linhasAtesto = doc.splitTextToSize(textoAtesto, contentWidth);
  doc.text(linhasAtesto, margin, y);
  y += linhasAtesto.length * 4.5 + 8;

  y = quebrarSeNecessario(doc, y, 40);
  const dataInspecao = formatarDataBR(state.data_inspecao || state.data_emissao);
  doc.setFont("helvetica", "bold");
  doc.text(`Data da inspeção: ${dataInspecao}`, margin, y);
  y += 18;

  // Linhas de Assinatura (2 Colunas)
  const colW = (contentWidth - 10) / 2;
  const x1 = margin;
  const x2 = margin + colW + 10;

  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.line(x1, y, x1 + colW, y);
  doc.line(x2, y, x2 + colW, y);
  y += 5;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("Responsável Técnico:", x1, y);
  doc.text("Proprietário / Responsável pelo uso", x2, y);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.text(rt.nome, x1, y);
  if (state.proprietario_nome || state.responsavel_uso_nome) {
    doc.text(state.proprietario_nome || state.responsavel_uso_nome || "", x2, y);
  }
  y += 4;

  if (state.responsavel_tecnico_titulo || rt.registro) {
    const tituloReg = [state.responsavel_tecnico_titulo, rt.registro].filter(Boolean).join(" - ");
    doc.text(`Título/Registro: ${tituloReg}`, x1, y);
  }

  if (state.comprovante_rt_numero) {
    y += 4;
    doc.text(`ART / RRT / TRT Nº: ${state.comprovante_rt_numero}`, x1, y);
  }
}

function nomeArquivo(state: AlarmeIn12State, modo: "scfire" | "cbmsc"): string {
  const prefixo = modo === "scfire" ? "Laudo_SCFire" : "Oficial_CBMSC";
  const nomeCliente = (state.cliente?.razao_social || state.edificacao || "Edificacao").replace(/\s+/g, "_");
  return `${prefixo}_Comissionamento_Alarme_IN12_${state.codigo || "rascunho"}_${nomeCliente}.pdf`;
}

/** Gera o PDF do Relatório de Comissionamento de Alarme de Incêndio (IN 12). */
export async function gerarPdfAlarmeIn12(
  state: AlarmeIn12State,
  modo: "scfire" | "cbmsc" = "scfire"
): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = 0;
  if (modo === "scfire") {
    y = await drawCabecalhoInstitucional(
      doc,
      "Relatório de Comissionamento do Sistema de Detecção e Alarme de Incêndio",
      "Conforme NBR 17240 e IN 12 / CBMSC",
      state.codigo
    );
  } else {
    y = await drawCabecalhoOficialCBMSC(
      doc,
      "Relatório de Comissionamento do Sistema de Detecção e Alarme de Incêndio (IN 12)"
    );
  }

  y = desenharIdentificacao(doc, y, state);
  y += 6;
  y = desenharChecklist(doc, y, state);
  y += 4;
  desenharAvaliacaoEAssinaturas(doc, y, state);

  const fileName = nomeArquivo(state, modo);
  doc.save(fileName);
  return fileName;
}
