"use client";

/**
 * Geradores de PDF da IN 02 — Formulário de Recurso (Anexo J) e Requerimento
 * de Ressarcimento de Multa PF/PJ (Anexo K/L). Cabeçalho oficial do CBMSC,
 * sem identidade visual SC Fire (mesmo padrão do Habite-se).
 */

import { jsPDF } from "jspdf";
import { drawCabecalhoOficialCBMSC, desenharTabelaRotulos, MARGIN_LEFT, MARGIN_RIGHT, PAGE_WIDTH } from "../shared/pdf-branding";
import { formatarDataBR } from "../shared/date-format";
import type { RecursoWizardState, RessarcimentoWizardState } from "./types";

const margin = MARGIN_LEFT;
const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

function nomeArquivoRecurso(state: RecursoWizardState): string {
  const nome = (state.autuado_nome || "recurso").replace(/\s+/g, "_");
  return `Formulario_Recurso_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/** Gera o PDF do Formulário de Recurso (Anexo J da IN 02/CBMSC) e dispara o download. */
export async function gerarPdfRecurso(state: RecursoWizardState): Promise<string> {
  const doc = new jsPDF();

  let y = await drawCabecalhoOficialCBMSC(doc, "FORMULÁRIO DE RECURSO");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const recebidoEm = formatarDataBR(state.auto_infracao_recebido_em);
  doc.text(`Recurso referente ao Auto de Infração Nº ${state.auto_infracao_numero || ""}    Recebido em: ${recebidoEm}`, margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. Autuado", margin, y);
  y += 3;
  y = desenharTabelaRotulos(doc, y, [
    [{ label: "Nome", valor: state.autuado_nome || "" }],
    [
      { label: "CPF/CNPJ", valor: state.autuado_cpf_cnpj || "" },
      { label: "E-mail", valor: state.autuado_email || "" },
    ],
    [{ label: "Telefone(s)", valor: state.autuado_telefone || "" }],
    [
      {
        label: "Logradouro",
        valor: `${state.autuado_logradouro || ""}  Nº: ${state.autuado_numero || ""}  Complemento: ${state.autuado_complemento || ""}  Bairro: ${state.autuado_bairro || ""}`,
      },
    ],
    [{ label: "Cidade", valor: `${state.autuado_cidade || ""}   CEP: ${state.autuado_cep || ""}` }],
  ]);
  y += 5;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("2. Descrição do imóvel", margin, y);
  y += 3;
  y = desenharTabelaRotulos(doc, y, [
    [
      { label: "RE", valor: state.imovel_re || "" },
      { label: "CNPJ", valor: state.imovel_cnpj || "" },
    ],
    [{ label: "Logradouro", valor: `${state.imovel_logradouro || ""}  Nº: ${state.imovel_numero || ""}  Complemento: ${state.imovel_complemento || ""}  Bairro: ${state.imovel_bairro || ""}` }],
    [{ label: "Cidade", valor: `${state.imovel_cidade || ""}   CEP: ${state.imovel_cep || ""}` }],
    [{ label: "Detalhes (se houver)", valor: state.imovel_detalhes || "" }],
  ]);
  y += 5;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("3. Argumentação", margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const linhasArgumentacao = doc.splitTextToSize(state.argumentacao || "", contentWidth);
  doc.text(linhasArgumentacao, margin, y);
  y += linhasArgumentacao.length * 5 + 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("4. Responsável por este recurso", margin, y);
  y += 3;
  const agora = new Date(state.data_emissao || Date.now());
  y = desenharTabelaRotulos(doc, y, [
    [
      { label: "Data", valor: agora.toLocaleDateString("pt-BR") },
      { label: "Hora", valor: agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) },
    ],
    [
      { label: "Nome", valor: state.responsavel_nome || "" },
      { label: "CPF", valor: state.responsavel_cpf || "" },
    ],
  ]);
  y += 15;
  doc.line(margin, y, margin + 80, y);
  doc.setFontSize(9);
  doc.text("Assinatura", margin, y + 5);

  const fileName = nomeArquivoRecurso(state);
  doc.save(fileName);
  return fileName;
}

function nomeArquivoRessarcimento(state: RessarcimentoWizardState): string {
  const nome = (state.requerente_nome || "ressarcimento").replace(/\s+/g, "_");
  return `Requerimento_Ressarcimento_Multa_${(state.tipo || "pf").toUpperCase()}_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/** Gera o PDF do Requerimento de Ressarcimento de Multa (Anexo K/L da IN 02/CBMSC) e dispara o download. */
export async function gerarPdfRessarcimento(state: RessarcimentoWizardState): Promise<string> {
  const doc = new jsPDF();

  const titulo = state.tipo === "pj" ? "Requerimento para ressarcimento de multa para pessoas jurídica" : "Requerimento para ressarcimento de multa para pessoas física";
  let y = await drawCabecalhoOficialCBMSC(doc, titulo);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Ao Serviço de Segurança Contra Incêndio de ${state.ssci_municipio || "___________________"}`, margin, y);
  y += 10;

  const valor = state.multa_valor ? `R$ ${state.multa_valor}` : "R$ ___";
  const corpo =
    state.tipo === "pj"
      ? `Eu, ${state.requerente_nome || "___________________"}, portador do CPF nº ${state.requerente_cpf || "___________________"}, representante legal da empresa ${state.empresa_razao_social || "___________________"}, CNPJ ${state.empresa_cnpj || "___________________"}, sirvo-me da presente para requerer ressarcimento dos valores relativos à multa ${state.multa_numero || "___________________"}, na importância de ${valor}${state.multa_valor_extenso ? ` (${state.multa_valor_extenso})` : ""}, referente à edificação conforme os dados que seguem:`
      : `Eu, ${state.requerente_nome || "___________________"}, portador do CPF nº ${state.requerente_cpf || "___________________"}, pessoa física, sirvo-me da presente para requerer ressarcimento dos valores relativos à multa ${state.multa_numero || "___________________"}, na importância de ${valor}${state.multa_valor_extenso ? ` (${state.multa_valor_extenso})` : ""}, referente à edificação conforme os dados que seguem:`;

  const linhasCorpo = doc.splitTextToSize(corpo, contentWidth);
  doc.text(linhasCorpo, margin, y);
  y += linhasCorpo.length * 5.5 + 6;

  doc.setFont("helvetica", "normal");
  doc.text(`Endereço: ${state.imovel_logradouro || ""}`, margin, y);
  y += 5.5;
  doc.text(`Nº: ${state.imovel_numero || ""}`, margin, y);
  y += 5.5;
  doc.text(`Bairro: ${state.imovel_bairro || ""}`, margin, y);
  y += 5.5;
  doc.text(`Município: ${state.imovel_municipio || ""}`, margin, y);
  y += 5.5;
  doc.text(`RE: ${state.imovel_re || ""}`, margin, y);
  y += 8;

  doc.text("O motivo do requerimento se dá conforme as seguintes argumentações:", margin, y);
  y += 6;
  const motivos = (state.motivos || []).filter((m) => m.trim());
  for (const motivo of motivos) {
    const linhas = doc.splitTextToSize(`- ${motivo};`, contentWidth - 4);
    doc.text(linhas, margin + 2, y);
    y += linhas.length * 5.5;
  }
  y += 6;

  doc.text("Neste termos", margin, y);
  y += 5.5;
  doc.text("Pede Deferimento", margin, y);
  y += 12;

  const agora = new Date(state.data_emissao || Date.now());
  const dataExtenso = agora.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`${state.local_data_municipio || state.imovel_municipio || "___________________"}, ${dataExtenso}`, margin, y);
  y += 20;

  doc.line(margin, y, margin + 80, y);
  y += 5;
  doc.text("(assinatura)", margin, y);
  y += 5.5;
  doc.text(state.requerente_nome || "Nome completo do requerente", margin, y);

  const fileName = nomeArquivoRessarcimento(state);
  doc.save(fileName);
  return fileName;
}
