"use client";

/**
 * Gerador de PDF da IN 10 — Sistema de Controle de Fumaça — Anexo B
 * (Relatório de Apresentação/Comissionamento) e Anexo C (Relatório de
 * Inspeção). Os dois compartilham o mesmo memorial de ensaios técnicos;
 * o que muda é a seção inicial (documentação deixada x instruções/integridade).
 */

import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import { drawCabecalhoOficialCBMSC, desenharTabelaRotulos, formatarRegistroProfissional, MARGIN_LEFT, MARGIN_RIGHT, PAGE_WIDTH } from "../shared/pdf-branding";
import { quebrarSeNecessario, type DocWithAutoTable } from "../shared/checklist-pdf";
import { formatarDataBR } from "../shared/date-format";
import { DOCS_DEIXADOS, INTEGRIDADE_COMPONENTES, ENSAIOS_FUMACA, type ChecklistItem } from "./constants";
import type { ControleFumacaState, RespostaSN } from "./types";

applyPlugin(jsPDF);

const margin = MARGIN_LEFT;
const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

function respostaTexto(v: RespostaSN | undefined): string {
  return v === "sim" ? "SIM" : v === "nao" ? "NÃO" : "";
}

/** RT agora e um Profissional cadastrado; os campos digitados a mao (rt_nome/rt_registro/rt_email/rt_fone) so aparecem em laudos salvos antes dessa mudanca. */
function resolverRt(state: ControleFumacaState): { nome: string; registro: string; email: string; fone: string } {
  if (state.rt) {
    return {
      nome: state.rt.nome,
      registro: formatarRegistroProfissional({ nome: state.rt.nome, registroTipo: state.rt.registro_tipo, registroNumero: state.rt.registro_numero }),
      email: state.rt.email ?? "",
      fone: state.rt.telefone ?? "",
    };
  }
  return { nome: state.rt_nome ?? "", registro: state.rt_registro ?? "", email: state.rt_email ?? "", fone: state.rt_fone ?? "" };
}

function desenharListaSimNao(doc: DocWithAutoTable, y: number, titulo: string, itens: ChecklistItem[], respostas: Record<string, RespostaSN>): number {
  let cursorY = quebrarSeNecessario(doc, y, 14 + itens.length * 7);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(titulo, margin, cursorY);
  cursorY += 3;

  const body = itens.map((item) => [item.texto, respostaTexto(respostas[item.chave])]);
  doc.autoTable({
    startY: cursorY,
    theme: "grid",
    body,
    styles: { fontSize: 8, cellPadding: 1.8, textColor: 0, lineColor: 0, lineWidth: 0.2, valign: "middle" },
    columnStyles: {
      0: { cellWidth: contentWidth - 22 },
      1: { cellWidth: 22, halign: "center" },
    },
    margin: { left: margin, right: MARGIN_RIGHT },
  });

  return doc.lastAutoTable.finalY + 6;
}

function desenharCabecalhoIdentificacao(doc: DocWithAutoTable, y: number, state: ControleFumacaState): number {
  const rt = resolverRt(state);
  return desenharTabelaRotulos(doc, y, [
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
      { label: "Fone", valor: state.proprietario_fone || "" },
    ],
    [
      { label: "Responsável uso/brigadista", valor: state.responsavel_uso_nome || "" },
      { label: "E-mail", valor: state.responsavel_uso_email || "" },
    ],
    [
      { label: "Responsável Técnico", valor: rt.nome },
      { label: "Nº de registro", valor: rt.registro },
    ],
    [
      { label: "E-mail do RT", valor: rt.email },
      { label: "Fone do RT", valor: rt.fone },
    ],
  ]);
}

function desenharClima(doc: DocWithAutoTable, y: number, state: ControleFumacaState): number {
  return desenharTabelaRotulos(doc, y, [
    [
      { label: "Velocidade do vento", valor: state.vento_velocidade || "" },
      { label: "Direção do vento", valor: state.vento_direcao || "" },
    ],
    [
      { label: "Temperatura externa", valor: state.temp_externa || "" },
      { label: "Pressão atmosférica", valor: state.pressao_atm || "" },
    ],
  ]);
}

function desenharConclusaoAssinaturas(doc: DocWithAutoTable, y: number, state: ControleFumacaState): void {
  const rt = resolverRt(state);
  let cursorY = quebrarSeNecessario(doc, y, 90);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Após a realização e verificação dos resultados dos ensaios, atesto que o sistema se encontra em condição de operação: ${respostaTexto(state.conclusao)}`,
    margin,
    cursorY,
    { maxWidth: contentWidth }
  );
  cursorY += 8;
  const dataEntrega = formatarDataBR(state.data_entrega_funcionamento);
  doc.text(`Data em que a instalação foi entregue em funcionamento: ${dataEntrega}`, margin, cursorY);
  cursorY += 10;

  doc.line(margin, cursorY, margin + 80, cursorY);
  cursorY += 5;
  doc.text(`Nome do instalador: ${state.nome_instalador || ""}`, margin, cursorY);
  cursorY += 6;
  doc.text(`Responsável técnico (Assinatura Digital): ${rt.nome}`, margin, cursorY);
  cursorY += 6;
  doc.text(`Nº do Registro Profissional: ${rt.registro}`, margin, cursorY);
  cursorY += 10;

  doc.setFont("helvetica", "bold");
  doc.text("Testemunhas", margin, cursorY);
  cursorY += 6;
  doc.setFont("helvetica", "normal");

  doc.line(margin, cursorY, margin + 80, cursorY);
  cursorY += 5;
  doc.text(
    `Representante do proprietário: ${state.testemunha_proprietario_nome || ""}   Cargo: ${state.testemunha_proprietario_cargo || ""}   Data: ${formatarDataBR(
      state.testemunha_proprietario_data
    )}`,
    margin,
    cursorY,
    { maxWidth: contentWidth }
  );
  cursorY += 10;

  doc.line(margin, cursorY, margin + 80, cursorY);
  cursorY += 5;
  doc.text(
    `Representante do instalador: ${state.testemunha_instalador_nome || ""}   Cargo: ${state.testemunha_instalador_cargo || ""}   Data: ${formatarDataBR(
      state.testemunha_instalador_data
    )}`,
    margin,
    cursorY,
    { maxWidth: contentWidth }
  );
  cursorY += 10;

  if (state.informacoes_adicionais) {
    cursorY = quebrarSeNecessario(doc, cursorY, 20);
    doc.setFont("helvetica", "bold");
    doc.text("Informações adicionais e anotações", margin, cursorY);
    cursorY += 5;
    doc.setFont("helvetica", "normal");
    const linhas = doc.splitTextToSize(state.informacoes_adicionais, contentWidth);
    doc.text(linhas, margin, cursorY);
  }
}

function nomeArquivo(state: ControleFumacaState, sufixo: string): string {
  const nome = (state.cliente?.razao_social || "imovel").replace(/\s+/g, "_");
  return `${sufixo}_Controle_Fumaca_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/** Gera o PDF do Anexo B (Relatório de Apresentação/Comissionamento do Sistema de Controle de Fumaça, IN 10/CBMSC). */
export async function gerarPdfComissionamentoFumaca(state: ControleFumacaState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoOficialCBMSC(doc, "ANEXO B — Relatório de Apresentação do Sistema de Controle de Fumaça");
  y = desenharCabecalhoIdentificacao(doc, y, state);
  y += 5;

  y = quebrarSeNecessario(doc, y, 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "A conclusão dos trabalhos, inspeção e ensaios deve ser feita pela equipe ou profissional independente e testemunhada pelo representante do proprietário.",
    margin,
    y,
    { maxWidth: contentWidth }
  );
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("Projeto", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`Instalação em conformidade com o projeto? ${respostaTexto(state.projeto_conformidade)}`, margin, y);
  y += 5;
  doc.text(`Equipamentos usados correspondem aos especificados no projeto? ${respostaTexto(state.projeto_equipamentos)}`, margin, y);
  y += 5;
  if (state.projeto_divergencias) {
    const linhas = doc.splitTextToSize(`Divergências: ${state.projeto_divergencias}`, contentWidth);
    doc.text(linhas, margin, y);
    y += linhas.length * 5;
  }
  y += 5;

  y = desenharListaSimNao(doc, y, "Documentação deixada no local", DOCS_DEIXADOS, state.docs_deixados || {});
  if (state.docs_explicacao) {
    const linhas = doc.splitTextToSize(`Observações: ${state.docs_explicacao}`, contentWidth);
    doc.text(linhas, margin, y);
    y += linhas.length * 5 + 5;
  }

  y = desenharClima(doc, y, state);
  y += 5;

  y = desenharListaSimNao(doc, y, "Ensaios", ENSAIOS_FUMACA, state.ensaios || {});
  if (state.tempo_ativacao_segundos) {
    y = quebrarSeNecessario(doc, y, 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Tempo para ativação: ${state.tempo_ativacao_segundos} segundos`, margin, y);
    y += 8;
  }
  if (state.ensaios_explicacao) {
    const linhas = doc.splitTextToSize(`Observações dos ensaios: ${state.ensaios_explicacao}`, contentWidth);
    doc.text(linhas, margin, y);
    y += linhas.length * 5 + 5;
  }

  desenharConclusaoAssinaturas(doc, y, state);

  const fileName = nomeArquivo(state, "Anexo_B_Apresentacao");
  doc.save(fileName);
  return fileName;
}

/** Gera o PDF do Anexo C (Relatório de Inspeção do Sistema de Controle de Fumaça, IN 10/CBMSC). */
export async function gerarPdfInspecaoFumaca(state: ControleFumacaState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoOficialCBMSC(doc, "ANEXO C — Relatório de Inspeção do Sistema de Controle de Fumaça");
  y = desenharCabecalhoIdentificacao(doc, y, state);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `O responsável pelo uso do sistema foi instruído quanto à localização dos registros, motoventilador, sistemas de detecção e demais componentes? ${respostaTexto(state.instrucao_realizada)}`,
    margin,
    y,
    { maxWidth: contentWidth }
  );
  y += 8;
  if (state.instrucao_nome_responsavel) {
    doc.text(`Nome do responsável instruído: ${state.instrucao_nome_responsavel}`, margin, y);
    y += 6;
  }
  if (state.instrucao_explicacao) {
    const linhas = doc.splitTextToSize(`Observações: ${state.instrucao_explicacao}`, contentWidth);
    doc.text(linhas, margin, y);
    y += linhas.length * 5 + 5;
  }

  y = desenharListaSimNao(doc, y, "Integridade dos componentes do sistema", INTEGRIDADE_COMPONENTES, state.integridade || {});
  if (state.integridade_explicacao) {
    y = quebrarSeNecessario(doc, y, 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const linhas = doc.splitTextToSize(`Observações: ${state.integridade_explicacao}`, contentWidth);
    doc.text(linhas, margin, y);
    y += linhas.length * 5 + 5;
  }

  y = desenharClima(doc, y, state);
  y += 5;

  y = desenharListaSimNao(doc, y, "Ensaios", ENSAIOS_FUMACA, state.ensaios || {});
  if (state.tempo_ativacao_segundos) {
    y = quebrarSeNecessario(doc, y, 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Tempo para ativação: ${state.tempo_ativacao_segundos} segundos`, margin, y);
    y += 8;
  }
  if (state.ensaios_explicacao) {
    const linhas = doc.splitTextToSize(`Observações dos ensaios: ${state.ensaios_explicacao}`, contentWidth);
    doc.text(linhas, margin, y);
    y += linhas.length * 5 + 5;
  }

  desenharConclusaoAssinaturas(doc, y, state);

  const fileName = nomeArquivo(state, "Anexo_C_Inspecao");
  doc.save(fileName);
  return fileName;
}
