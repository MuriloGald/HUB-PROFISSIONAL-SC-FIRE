"use client";

/**
 * Gerador de PDF do modulo Habite-se — Termo de Entrega do Imovel, usando
 * jsPDF + jsPDF-AutoTable (mesmo motor dos demais geradores do hub).
 * Porta o modelo de documento do CBMSC/SC fornecido pelo usuario (Google Docs).
 *
 * Documento unico, sem variacao de "porte" como no modulo de Eventos — sempre
 * as mesmas 6 secoes. Geracao e assincrona por causa do cabecalho institucional
 * (carrega o logo) e das fotos dos sistemas instalados (Supabase Storage).
 */

import { jsPDF } from "jspdf";
import { applyPlugin, type RowInput } from "jspdf-autotable";
import { RESPONSAVEIS_TECNICOS, EMPRESA, SISTEMAS_CONFORMIDADE } from "./constants";
import {
  carregarImagemComoDataUrl,
  drawCabecalhoInstitucional,
  COR_CINZA_INSTITUCIONAL,
  MARGIN_TOP,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  PAGE_WIDTH,
  PAGE_BREAK_Y,
} from "../shared/pdf-branding";
import type { HabiteseWizardState, ResponsavelTecnicoCustom, SistemaConformidade } from "./types";

applyPlugin(jsPDF);

type DocWithAutoTable = jsPDF & {
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable: { finalY: number };
};

const margin = MARGIN_LEFT;
const pageWidth = PAGE_WIDTH;
const contentWidth = pageWidth - MARGIN_LEFT - MARGIN_RIGHT;

function resolverRt(state: HabiteseWizardState): ResponsavelTecnicoCustom {
  if (state.rt?.chave === "outro" && state.rt.custom) {
    return state.rt.custom;
  }
  const fixo = RESPONSAVEIS_TECNICOS[state.rt?.chave ?? "rt1"];
  return { nome: fixo.nome, cpf: fixo.cpf, telefone: fixo.telefone, email: fixo.email, registro: fixo.nr_rt };
}

/** Quebra a página se o bloco a partir de `y` (com a altura `blockHeight` informada) não couber até a margem inferior. */
function quebrarSeNecessario(doc: DocWithAutoTable, y: number, blockHeight = 0): number {
  if (y + blockHeight > PAGE_BREAK_Y) {
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

function drawResponsavelImovel(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "1. RESPONSÁVEL PELO IMÓVEL");
  const c = state.cliente || ({} as NonNullable<HabiteseWizardState["cliente"]>);

  const body: RowInput[] = [
    [`Nome: ${c.razao_social || ""}`, `Telefone(s): ${c.telefone || ""}${c.ramal ? ` ramal ${c.ramal}` : ""}`],
    [`CPF/CNPJ: ${c.cnpj || c.cpf || ""}`, `E-mail: ${c.email || ""}`],
    [{ content: `Logradouro: ${c.logradouro || ""}  Nº: ${c.numero || ""}  Complemento: ${c.complemento || ""}  Bairro: ${c.bairro || ""}`, colSpan: 2 }],
    [{ content: `Cidade: ${c.cidade || ""} – ${c.estado || "Santa Catarina"}   CEP: ${c.cep || ""}`, colSpan: 2 }],
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

function drawResponsavelTecnico(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "2. RESPONSÁVEL TÉCNICO PELA EXECUÇÃO DA OBRA");
  const rt = resolverRt(state);

  const body: RowInput[] = [
    [`Nome: ${rt.nome}`, `Telefone(s): ${rt.telefone}`],
    [`CPF: ${rt.cpf}`, `E-mail: ${rt.email}`],
    [{ content: `Nº de registro no conselho de classe: ${rt.registro}`, colSpan: 2 }],
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

function drawDescricaoImovel(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "3. DESCRIÇÃO DO IMÓVEL");
  const c = state.cliente || ({} as NonNullable<HabiteseWizardState["cliente"]>);

  const body: RowInput[] = [
    [`RE: ${state.imovel_re || ""}`, `CNPJ/CPF: ${state.imovel_cnpj_cpf || c.cnpj || c.cpf || ""}`],
    [
      { content: `Logradouro: ${state.imovel_logradouro || ""}  Nº: ${state.imovel_numero || ""}  Complemento: ${state.imovel_complemento || ""}  Bairro: ${state.imovel_bairro || ""}`, colSpan: 2 },
    ],
    [{ content: `Cidade: ${state.imovel_cidade || ""}   CEP: ${state.imovel_cep || ""}`, colSpan: 2 }],
    [{ content: `Detalhes (se houver): ${state.imovel_detalhes || ""}`, colSpan: 2 }],
    [
      `Extintor PQS 4KG – ${state.extintores_qtd || "0"}`,
      `Iluminação de emergência: ${state.iluminacao_qtd || "0"}`,
    ],
    [{ content: `Placa saída fotoluminescente – ${state.placa_qtd || "0"}`, colSpan: 2 }],
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

function drawDadosSolicitacao(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "4. DADOS DA SOLICITAÇÃO");

  const riscoTexto = (["II", "III", "IV", "V"] as const).map((r) => (state.risco === r ? `(X) ${r}` : `( ) ${r}`)).join("  ");

  const body: RowInput[] = [
    [`Área total da solicitação (m²): ${state.area_total || ""}`, `Protocolo: ${state.protocolo || ""}`],
    [`Área da alteração/ampliação/reforma: ${state.area_alteracao || ""}`, `Ocupação(ões): ${state.ocupacao || ""}`],
    [`Risco: ${riscoTexto}`, `Nº de pavimentos/blocos: ${state.pavimentos_blocos || ""}`],
    [{ content: `Observações: ${state.observacoes || ""}`, colSpan: 2 }],
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

async function drawDescritivoSistemas(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): Promise<number> {
  let cursorY = drawSecaoTitulo(doc, y, "5. DESCRITIVO DOS SISTEMAS E MEDIDAS DE SEGURANÇA CONTRA INCÊNDIO INSTALADOS");
  cursorY += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const texto =
    "Apresentar o descritivo quali-quantitativo dos sistemas e medidas de segurança contra incêndio executados no imóvel, anexando no mínimo uma foto ilustrativa de cada sistema previsto.";
  const linhas = doc.splitTextToSize(texto, contentWidth);
  doc.text(linhas, margin, cursorY);
  cursorY += linhas.length * 5 + 6;

  const imagens = state.imagens || [];
  const w = 100;
  const h = 65;
  let n = 1;
  for (const img of imagens) {
    // Reserva o bloco inteiro (imagem + legenda) antes de decidir se quebra a
    // pagina — checar so o Y atual (sem a altura da imagem) deixava a foto
    // "vazar" pra baixo da margem quando ela nao cabia inteira na pagina.
    cursorY = quebrarSeNecessario(doc, cursorY, h + 14);
    const carregada = await carregarImagemComoDataUrl(img.url);
    if (!carregada) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(`[Imagem indisponível: ${img.legenda || img.url}]`, margin, cursorY);
      cursorY += 6;
      continue;
    }
    doc.addImage(carregada.dataUrl, carregada.format, margin, cursorY, w, h, undefined, "MEDIUM");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
    doc.text(`Imagem ${String(n++).padStart(2, "0")}${img.legenda ? ` – ${img.legenda}` : ""}`, margin, cursorY + h + 4);
    doc.setTextColor(0, 0, 0);
    cursorY += h + 10;
  }

  return cursorY + 4;
}

function drawDeclaracao(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): void {
  let cursorY = y;
  if (cursorY > PAGE_BREAK_Y - 70) {
    doc.addPage();
    cursorY = MARGIN_TOP + 10;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("6. DECLARAÇÃO DE ENTREGA E RECEBIMENTO", margin, cursorY);
  cursorY += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const textoRecebimento =
    "Declaro que recebi o imóvel conforme o descritivo apresentado, em conformidade com as NSCI, estando ciente de que após o recebimento é minha responsabilidade manter as características do imóvel inalteradas, bem como a operacionalidade e manutenção dos SMSCI previstos.";
  const linhasRecebimento = doc.splitTextToSize(textoRecebimento, contentWidth);
  doc.text(linhasRecebimento, margin, cursorY);
  cursorY += linhasRecebimento.length * 5 + 25;

  cursorY = quebrarSeNecessario(doc, cursorY);
  doc.line(margin, cursorY, margin + 80, cursorY);
  doc.text("Assinatura do responsável pelo imóvel", margin, cursorY + 5);
  doc.text(state.cliente?.razao_social || "", margin, cursorY + 10);
  cursorY += 30;

  cursorY = quebrarSeNecessario(doc, cursorY);
  const textoEntrega = "Declaro que realizei a entrega do imóvel em conformidade com o descritivo apresentado.";
  const linhasEntrega = doc.splitTextToSize(textoEntrega, contentWidth);
  doc.text(linhasEntrega, margin, cursorY);
  cursorY += linhasEntrega.length * 5 + 25;

  cursorY = quebrarSeNecessario(doc, cursorY);
  const rt = resolverRt(state);
  doc.line(margin, cursorY, margin + 80, cursorY);
  doc.text("Assinatura do responsável técnico", margin, cursorY + 5);
  doc.text(rt.nome, margin, cursorY + 10);
}

function nomeArquivo(state: HabiteseWizardState): string {
  const nome = (state.cliente?.razao_social || "imovel").replace(/\s+/g, "_");
  return `Termo_Entrega_Imovel_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/** Gera o PDF do Termo de Entrega do Imóvel e dispara o download no navegador. Retorna o nome do arquivo gerado. */
export async function gerarPdf(state: HabiteseWizardState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoInstitucional(doc, "Termo de Entrega do Imóvel", "HABITE-SE", state.codigo);
  y = drawResponsavelImovel(doc, y, state);
  y = drawResponsavelTecnico(doc, y, state);
  y = drawDescricaoImovel(doc, y, state);
  y = drawDadosSolicitacao(doc, y, state);
  y = await drawDescritivoSistemas(doc, y, state);
  drawDeclaracao(doc, y, state);

  const fileName = nomeArquivo(state);
  doc.save(fileName);
  return fileName;
}

/* ============================================================
 * ANEXO H — Relatorio de Conformidade referente a atestado para Habite-se
 * ============================================================ */

function drawResponsavelTecnicoAnexoH(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "1. RESPONSÁVEL TÉCNICO PELA EXECUÇÃO DA OBRA");
  const rt = resolverRt(state);

  const body: RowInput[] = [
    [`Nome: ${rt.nome}`, `Telefone(s): ${rt.telefone}`],
    [`CPF/CNPJ: ${rt.cpf}`, `E-mail: ${rt.email}`],
    [{ content: `Logradouro: ${EMPRESA.endereco}  Nº: ${EMPRESA.numero}  Complemento: ${EMPRESA.complemento}  Bairro: ${EMPRESA.bairro}`, colSpan: 2 }],
    [{ content: `Cidade: ${EMPRESA.cidade}   CEP: ${EMPRESA.cep}`, colSpan: 2 }],
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

function drawDescricaoImovelAnexoH(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "2. DESCRIÇÃO DO IMÓVEL");
  const c = state.cliente || ({} as NonNullable<HabiteseWizardState["cliente"]>);

  const body: RowInput[] = [
    [`RE: ${state.imovel_re || ""}`, `CNPJ/CPF: ${state.imovel_cnpj_cpf || c.cnpj || c.cpf || ""}`],
    [`Protocolo PPCI: ${state.protocolo || ""}`, `Ocupação: ${state.ocupacao || ""}`],
    [
      { content: `Logradouro: ${state.imovel_logradouro || ""}  Nº: ${state.imovel_numero || ""}  Complemento: ${state.imovel_complemento || ""}  Bairro: ${state.imovel_bairro || ""}`, colSpan: 2 },
    ],
    [{ content: `Cidade: ${state.imovel_cidade || ""}   CEP: ${state.imovel_cep || ""}`, colSpan: 2 }],
    [`Nome da edificação: ${state.nome_edificacao || c.razao_social || ""}`, `Nome da empresa: ${c.razao_social || ""}`],
    [{ content: `Detalhes (se houver): ${state.imovel_detalhes || ""}`, colSpan: 2 }],
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

function statusSimNao(v: SistemaConformidade["conformePpci"]): string {
  return v === "sim" ? "SIM" : v === "nao" ? "NÃO" : "";
}

function drawRelatorioSistemas(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "3. RELATÓRIO DOS SISTEMAS E MEDIDAS DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO");

  const porChave = new Map((state.sistemas || []).map((s) => [s.chave, s]));

  const head = [["Sistema", "PPCI", "NSCI", "Justificativa"]];
  const body = SISTEMAS_CONFORMIDADE.map(({ chave, label }) => {
    const s = porChave.get(chave);
    return [
      label,
      statusSimNao(s?.conformePpci ?? ""),
      statusSimNao(s?.conformeNsci ?? ""),
      s?.justificativa || (s?.conformePpci || s?.conformeNsci ? "" : "Não se aplica"),
    ];
  });

  doc.autoTable({
    startY: startY + 3,
    theme: "grid",
    head,
    body,
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold", halign: "center", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 1.5, textColor: 0, lineColor: 0, lineWidth: 0.2, valign: "middle" },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: contentWidth - 91 },
    },
    margin: { left: margin, right: MARGIN_RIGHT },
  });

  return doc.lastAutoTable.finalY + 8;
}

function drawDeclaracaoAnexoH(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): void {
  let cursorY = quebrarSeNecessario(doc, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const texto =
    "Na qualidade de responsável técnico pela execução dos SMSCI, declaro que as informações prestadas neste documento são verdadeiras e estou ciente de minha responsabilidade acerca dos SMSCI do imóvel, conforme definido pela Lei Estadual nº 16.157 de 2013. O descumprimento ocasiona aplicação das sanções legais cabíveis, além de possível responsabilidade civil e criminal.";
  const linhas = doc.splitTextToSize(texto, contentWidth);
  doc.text(linhas, margin, cursorY);
  cursorY += linhas.length * 5 + 25;

  cursorY = quebrarSeNecessario(doc, cursorY);
  const rt = resolverRt(state);
  const dataEmissao = new Date(state.data_emissao || Date.now()).toLocaleDateString("pt-BR");
  doc.line(margin, cursorY, margin + 80, cursorY);
  doc.text("Assinatura do Responsável Técnico", margin, cursorY + 5);
  doc.text(rt.nome, margin, cursorY + 10);
  doc.text(`Data: ${dataEmissao}`, margin, cursorY + 15);
}

function nomeArquivoAnexoH(state: HabiteseWizardState): string {
  const nome = (state.cliente?.razao_social || "imovel").replace(/\s+/g, "_");
  return `Anexo_H_Relatorio_Conformidade_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/** Gera o PDF do Anexo H (Relatório de Conformidade para Habite-se) a partir dos mesmos dados do Termo de Entrega. Retorna o nome do arquivo gerado. */
export async function gerarPdfAnexoH(state: HabiteseWizardState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoInstitucional(doc, "Relatório de Conformidade", "ATESTADO PARA HABITE-SE", state.codigo);
  y = drawResponsavelTecnicoAnexoH(doc, y, state);
  y = drawDescricaoImovelAnexoH(doc, y, state);
  y = drawRelatorioSistemas(doc, y, state);
  drawDeclaracaoAnexoH(doc, y, state);

  const fileName = nomeArquivoAnexoH(state);
  doc.save(fileName);
  return fileName;
}
