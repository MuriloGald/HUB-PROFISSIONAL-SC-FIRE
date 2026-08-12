"use client";

/**
 * Gerador de PDF da IN 09 — Anexo E — Relatório de Comissionamento do Elevador
 * de Emergência. Cabeçalho oficial do CBMSC, sem identidade visual SC Fire.
 */

import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import { drawCabecalhoOficialCBMSC, desenharTabelaRotulos, formatarRegistroProfissional, MARGIN_LEFT, MARGIN_RIGHT, PAGE_WIDTH } from "../shared/pdf-branding";
import { desenharSecaoChecklist, quebrarSeNecessario, type DocWithAutoTable } from "../shared/checklist-pdf";
import { SECOES_ELEVADOR } from "./constants";
import type { ComissionamentoElevadorState } from "./types";

applyPlugin(jsPDF);

const margin = MARGIN_LEFT;
const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

function nomeArquivo(state: ComissionamentoElevadorState): string {
  const nome = (state.cliente?.razao_social || "imovel").replace(/\s+/g, "_");
  return `Anexo_E_Comissionamento_Elevador_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/** RT agora e um Profissional cadastrado; os campos digitados a mao (rt_nome/rt_registro/rt_email/rt_fone) so aparecem em laudos salvos antes dessa mudanca. */
function resolverRt(state: ComissionamentoElevadorState): { nome: string; registro: string; contato: string } {
  if (state.rt) {
    return {
      nome: state.rt.nome,
      registro: formatarRegistroProfissional({ nome: state.rt.nome, registroTipo: state.rt.registro_tipo, registroNumero: state.rt.registro_numero }),
      contato: [state.rt.email, state.rt.telefone].filter(Boolean).join(" "),
    };
  }
  return { nome: state.rt_nome ?? "", registro: state.rt_registro ?? "", contato: `${state.rt_email || ""} ${state.rt_fone || ""}`.trim() };
}

/** Gera o PDF do Anexo E (Relatório de Comissionamento do Elevador de Emergência, IN 09/CBMSC) e dispara o download. */
export async function gerarPdfComissionamentoElevador(state: ComissionamentoElevadorState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoOficialCBMSC(doc, "ANEXO E — Relatório de Comissionamento do Elevador de Emergência");
  const rt = resolverRt(state);

  y = desenharTabelaRotulos(doc, y, [
    [{ label: "Logradouro", valor: `${state.logradouro || ""}  Nº: ${state.numero || ""}  Complemento: ${state.complemento || ""}` }],
    [
      { label: "Bairro", valor: state.bairro || "" },
      { label: "Município-UF", valor: state.municipio || "" },
    ],
    [
      { label: "RE", valor: state.re || "" },
      { label: "Qtd. de Elevadores de Emergência", valor: state.qtd_elevadores || "" },
    ],
    [{ label: "Altura da edificação (m)", valor: state.altura_edificacao || "" }],
    [
      { label: "Responsável pelo imóvel", valor: state.responsavel_imovel_nome || "" },
      { label: "E-mail/Fone", valor: `${state.responsavel_imovel_email || ""} ${state.responsavel_imovel_fone || ""}` },
    ],
    [
      { label: "Responsável Técnico", valor: rt.nome },
      { label: "Nº de registro", valor: rt.registro },
    ],
    [{ label: "E-mail/Fone do RT", valor: rt.contato }],
  ]);
  y += 5;

  const respostas = state.respostas || {};
  for (const secao of SECOES_ELEVADOR) {
    y = desenharSecaoChecklist(doc, y, secao, respostas, true);
  }

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Relação dos elevadores (tipo, fabricante, transporte de maca, lotação máxima, ano de fabricação)", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const linhasElev = doc.splitTextToSize(state.elevadores_info || "-", contentWidth);
  doc.text(linhasElev, margin, y);
  y += linhasElev.length * 5 + 8;

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFont("helvetica", "bold");
  doc.text("Justificativas técnicas para não atendimento dos itens assinalados", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const linhasJust = doc.splitTextToSize(state.justificativas || "-", contentWidth);
  doc.text(linhasJust, margin, y);
  y += linhasJust.length * 5 + 8;

  y = quebrarSeNecessario(doc, y, 40);
  const textoAtesto =
    "Atesto, nesta data, que a instalação foi inspecionada e está em conformidade com as prescrições da IN 9, estando o proprietário ou responsável pelo uso ciente de suas responsabilidades.";
  const linhasAtesto = doc.splitTextToSize(textoAtesto, contentWidth);
  doc.text(linhasAtesto, margin, y);
  y += linhasAtesto.length * 5 + 8;

  const dataEmissao = state.data_emissao ? new Date(state.data_emissao).toLocaleDateString("pt-BR") : "";
  doc.text(`Data da inspeção: ${dataEmissao}`, margin, y);
  y += 15;
  doc.line(margin, y, margin + 100, y);
  y += 5;
  doc.text(`Responsável Técnico (Assinatura Digital): ${rt.nome}${rt.registro ? ` — ${rt.registro}` : ""}`, margin, y);

  const fileName = nomeArquivo(state);
  doc.save(fileName);
  return fileName;
}
