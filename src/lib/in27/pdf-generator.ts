"use client";

/**
 * Geradores de PDF da IN 27 — Anexo A (Modelo de Requerimento), Anexo B
 * (Modelo de Plano de Segurança) e Anexo C (Sugestão de Modelo de Croqui)
 * para eventos pirotécnicos. Cabeçalho oficial do CBMSC.
 */

import { jsPDF } from "jspdf";
import {
  drawCabecalhoOficialCBMSC,
  desenharTabelaRotulos,
  carregarImagemComoDataUrl,
  formatarRegistroProfissional,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  PAGE_WIDTH,
} from "../shared/pdf-branding";
import { quebrarSeNecessario } from "../shared/checklist-pdf";
import { formatarDataBR } from "../shared/date-format";
import type { EventoPirotecnicoState } from "./types";

const margin = MARGIN_LEFT;
const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

/** RT agora e um Profissional cadastrado; os campos digitados a mao (rt_nome/rt_registro/rt_fone/rt_email) so aparecem em eventos salvos antes dessa mudanca. Nao se aplica quando rt_e_blaster (o blaster nao e um Profissional CREA/CFT cadastrado). */
function resolverRt(state: EventoPirotecnicoState): { nome: string; registro: string; fone: string; email: string } {
  if (state.rt) {
    return {
      nome: state.rt.nome,
      registro: formatarRegistroProfissional({ nome: state.rt.nome, registroTipo: state.rt.registro_tipo, registroNumero: state.rt.registro_numero }),
      fone: state.rt.telefone ?? "",
      email: state.rt.email ?? "",
    };
  }
  return { nome: state.rt_nome ?? "", registro: state.rt_registro ?? "", fone: state.rt_fone ?? "", email: state.rt_email ?? "" };
}

function nomeArquivo(state: EventoPirotecnicoState, sufixo: string): string {
  const nome = (state.cliente?.razao_social || state.promotor_nome || "evento").replace(/\s+/g, "_");
  return `${sufixo}_Evento_Pirotecnico_${state.codigo || "rascunho"}_${nome}.pdf`;
}

function desenharDadosEvento(doc: jsPDF, y: number, state: EventoPirotecnicoState): number {
  const tipo = state.tipo_evento === "outdoor" ? "( X ) outdoor   (   ) indoor" : "( X ) indoor   (   ) outdoor";
  return desenharTabelaRotulos(doc, y, [
    [
      { label: "Tipo de evento pirotécnico", valor: tipo },
      { label: "Data / Horário de início", valor: `${formatarDataBR(state.data_evento)} ${state.horario_inicio || ""}` },
    ],
    [{ label: "Logradouro", valor: `${state.evento_logradouro || ""}  Nº: ${state.evento_numero || ""}  Complemento: ${state.evento_complemento || ""}  Bairro: ${state.evento_bairro || ""}` }],
    [{ label: "Cidade", valor: `${state.evento_cidade || ""}   CEP: ${state.evento_cep || ""}` }],
    [{ label: "Descrição do evento", valor: state.descricao_evento || "" }],
  ]);
}

function desenharPromotor(doc: jsPDF, y: number, state: EventoPirotecnicoState): number {
  return desenharTabelaRotulos(doc, y, [
    [{ label: "Nome", valor: state.promotor_nome || "" }],
    [
      { label: "CPF ou CNPJ", valor: state.promotor_cpf_cnpj || "" },
      { label: "Fone/E-mail", valor: `${state.promotor_fone || ""} ${state.promotor_email || ""}` },
    ],
    [{ label: "Logradouro", valor: `${state.promotor_logradouro || ""}  Nº: ${state.promotor_numero || ""}  Complemento: ${state.promotor_complemento || ""}  Bairro: ${state.promotor_bairro || ""}` }],
    [{ label: "Cidade", valor: `${state.promotor_cidade || ""}   CEP: ${state.promotor_cep || ""}` }],
  ]);
}

/** Gera o PDF do Anexo A (Modelo de Requerimento, IN 27/CBMSC) e dispara o download. */
export async function gerarPdfRequerimento(state: EventoPirotecnicoState): Promise<string> {
  const doc = new jsPDF();
  const rt = resolverRt(state);

  let y = await drawCabecalhoOficialCBMSC(doc, "ANEXO A — MODELO DE REQUERIMENTO");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. Sobre o evento", margin, y);
  y += 3;
  y = desenharDadosEvento(doc, y, state);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("2. Sobre o promotor do evento", margin, y);
  y += 3;
  y = desenharPromotor(doc, y, state);
  y += 5;

  y = quebrarSeNecessario(doc, y, 20);
  doc.setFont("helvetica", "bold");
  doc.text("3. Sobre o blaster", margin, y);
  y += 3;
  y = desenharTabelaRotulos(doc, y, [
    [
      { label: "Nome", valor: state.blaster_nome || "" },
      { label: "Nº do registro no exército", valor: state.blaster_registro_exercito || "" },
    ],
  ]);
  y += 5;

  y = quebrarSeNecessario(doc, y, 20);
  doc.setFont("helvetica", "bold");
  doc.text("4. Sobre o responsável técnico pelo espetáculo pirotécnico", margin, y);
  y += 3;
  if (state.rt_e_blaster) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("(X) se for o blaster, assinalar esta alternativa e não preencher novamente", margin, y);
    y += 8;
  } else {
    y = desenharTabelaRotulos(doc, y, [
      [
        { label: "Nome", valor: rt.nome },
        { label: "Nº do registro", valor: rt.registro },
      ],
    ]);
    y += 5;
  }

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("5. Descrição das classes de fogos de artifício que serão utilizados e suas respectivas quantidades", margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const linhasClasses = doc.splitTextToSize(state.classes_fogos || "-", contentWidth);
  doc.text(linhasClasses, margin, y);
  y += linhasClasses.length * 5 + 8;

  y = quebrarSeNecessario(doc, y, 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("6. Termo de Responsabilidade", margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const textoTermo =
    "Na qualidade de responsável pelo evento firmo o presente termo de responsabilidade comprometendo-me em observar todas as normas de segurança relacionadas ao evento pirotécnico, bem como responsabilizar-me por qualquer dano que vier a causar a terceiros em decorrência da execução do espetáculo pirotécnico e/ou qualidade do produto utilizado.";
  const linhasTermo = doc.splitTextToSize(textoTermo, contentWidth);
  doc.text(linhasTermo, margin, y);
  y += linhasTermo.length * 5 + 15;

  y = quebrarSeNecessario(doc, y, 30);
  doc.line(margin, y, margin + 80, y);
  doc.line(margin + 100, y, margin + 180, y);
  y += 5;
  doc.text("Assinatura do promotor do evento", margin, y);
  doc.text("Assinatura do responsável técnico", margin + 100, y);
  y += 5;
  doc.text(state.promotor_nome || "", margin, y);
  doc.text(state.rt_e_blaster ? state.blaster_nome || "" : rt.nome, margin + 100, y);

  const fileName = nomeArquivo(state, "Anexo_A_Requerimento");
  doc.save(fileName);
  return fileName;
}

/** Gera o PDF do Anexo B (Modelo de Plano de Segurança, IN 27/CBMSC) e dispara o download. */
export async function gerarPdfPlanoSeguranca(state: EventoPirotecnicoState): Promise<string> {
  const doc = new jsPDF();
  const rt = resolverRt(state);

  let y = await drawCabecalhoOficialCBMSC(doc, "ANEXO B — MODELO DE PLANO DE SEGURANÇA");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. Sobre o evento", margin, y);
  y += 3;
  y = desenharDadosEvento(doc, y, state);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("2. Sobre o promotor do evento", margin, y);
  y += 3;
  y = desenharPromotor(doc, y, state);
  y += 5;

  y = quebrarSeNecessario(doc, y, 20);
  doc.setFont("helvetica", "bold");
  doc.text("3. Sobre o blaster", margin, y);
  y += 3;
  y = desenharTabelaRotulos(doc, y, [
    [
      { label: "Nome", valor: state.blaster_nome || "" },
      { label: "Nº do registro no exército", valor: state.blaster_registro_exercito || "" },
    ],
    [{ label: "Fone/E-mail", valor: `${state.blaster_fone || ""} ${state.blaster_email || ""}` }],
    [{ label: "Logradouro", valor: `${state.blaster_logradouro || ""}  Nº: ${state.blaster_numero || ""}  Complemento: ${state.blaster_complemento || ""}  Bairro: ${state.blaster_bairro || ""}` }],
    [{ label: "Cidade", valor: `${state.blaster_cidade || ""}   CEP: ${state.blaster_cep || ""}` }],
  ]);
  y += 5;

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFont("helvetica", "bold");
  doc.text("4. Sobre o responsável técnico pelo espetáculo pirotécnico", margin, y);
  y += 3;
  if (state.rt_e_blaster) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("(X) se for o blaster, assinalar esta alternativa e não preencher novamente", margin, y);
    y += 8;
  } else {
    y = desenharTabelaRotulos(doc, y, [
      [
        { label: "Nome", valor: rt.nome },
        { label: "Nº do registro", valor: rt.registro },
      ],
      [{ label: "Fone/E-mail", valor: `${rt.fone} ${rt.email}` }],
      [{ label: "Logradouro", valor: `${state.rt_logradouro || ""}  Nº: ${state.rt_numero || ""}  Complemento: ${state.rt_complemento || ""}  Bairro: ${state.rt_bairro || ""}` }],
      [{ label: "Cidade", valor: `${state.rt_cidade || ""}   CEP: ${state.rt_cep || ""}` }],
    ]);
    y += 5;
  }

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("5. Descrição das classes de fogos de artifício que serão utilizados e suas respectivas quantidades", margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const linhasClasses = doc.splitTextToSize(state.classes_fogos || "-", contentWidth);
  doc.text(linhasClasses, margin, y);
  y += linhasClasses.length * 5 + 8;

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("6. Anexos a este plano de segurança estão, pelo menos, os seguintes documentos", margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`${state.anexo_carteira_blaster ? "(X)" : "( )"} Cópia da carteira do Técnico em Pirotecnia (Blaster), com registro no Estado de Santa Catarina`, margin, y, { maxWidth: contentWidth });
  y += 6;
  doc.text(`${state.anexo_croqui_projeto ? "(X)" : "( )"} Croqui local ou projeto de segurança`, margin, y);
  y += 12;

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("7. Assinatura responsável técnico pelo espetáculo pirotécnico", margin, y);
  y += 15;
  doc.line(margin, y, margin + 80, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(state.rt_e_blaster ? state.blaster_nome || "" : rt.nome, margin, y);

  const fileName = nomeArquivo(state, "Anexo_B_Plano_Seguranca");
  doc.save(fileName);
  return fileName;
}

/** Gera o PDF do Anexo C (Sugestão de Modelo de Croqui, IN 27/CBMSC) e dispara o download. */
export async function gerarPdfCroqui(state: EventoPirotecnicoState): Promise<string> {
  const doc = new jsPDF();
  const rt = resolverRt(state);

  let y = await drawCabecalhoOficialCBMSC(doc, "ANEXO C — SUGESTÃO DE MODELO DE CROQUI");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const legendas = [
    "Riscos especiais",
    "Área autorizada para presença de público",
    "Distância do público, vias públicas e edificações",
    "ÁREA DE QUEIMA",
    "Distância de fontes de riscos especiais",
  ];
  doc.setFont("helvetica", "bold");
  doc.text("Elementos a indicar no croqui:", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  for (const l of legendas) {
    doc.text(`•  ${l}`, margin + 2, y);
    y += 5.5;
  }
  y += 5;

  if (state.croqui_imagem?.url) {
    const carregada = await carregarImagemComoDataUrl(state.croqui_imagem.url);
    if (carregada) {
      const w = contentWidth;
      const h = 120;
      y = quebrarSeNecessario(doc, y, h + 10);
      doc.addImage(carregada.dataUrl, carregada.format, margin, y, w, h, undefined, "MEDIUM");
      y += h + 8;
    }
  }

  if (state.croqui_observacoes) {
    y = quebrarSeNecessario(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.text("Observações relevantes acerca do evento pirotécnico", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const linhas = doc.splitTextToSize(state.croqui_observacoes, contentWidth);
    doc.text(linhas, margin, y);
    y += linhas.length * 5 + 10;
  }

  y = quebrarSeNecessario(doc, y, 20);
  doc.line(margin, y, margin + 80, y);
  y += 5;
  doc.text("Assinatura responsável técnico pelo espetáculo pirotécnico", margin, y);
  y += 5;
  doc.text(state.rt_e_blaster ? state.blaster_nome || "" : rt.nome, margin, y);

  const fileName = nomeArquivo(state, "Anexo_C_Croqui");
  doc.save(fileName);
  return fileName;
}
