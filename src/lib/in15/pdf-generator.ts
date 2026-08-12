"use client";

/**
 * Gerador de PDF da IN 15 — Sistema de Chuveiros Automáticos — Anexo B
 * (Comissionamento) e Anexo C (Inspeção). O Anexo B real do CBMSC é um
 * memorial de ensaios NFPA extenso (5 páginas) — aqui capturamos os campos
 * de identificação e os testes mais decisivos em formulário, e o restante
 * do memorial técnico (testes hidrostáticos, soldagem, flush test etc.)
 * como um bloco de texto complementar, para não inflar o formulário com
 * dezenas de campos de baixíssima frequência de uso.
 */

import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import { drawCabecalhoOficialCBMSC, desenharTabelaRotulos, formatarRegistroProfissional, MARGIN_LEFT, MARGIN_RIGHT, PAGE_WIDTH } from "../shared/pdf-branding";
import { desenharSecaoChecklist, quebrarSeNecessario, type DocWithAutoTable } from "../shared/checklist-pdf";
import { formatarDataBR } from "../shared/date-format";
import { SECOES_CHUVEIROS } from "./constants";
import type { ChuveirosState, RespostaSN } from "./types";

applyPlugin(jsPDF);

const margin = MARGIN_LEFT;
const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

function respostaTexto(v: RespostaSN | undefined): string {
  return v === "sim" ? "SIM" : v === "nao" ? "NÃO" : "";
}

/** RT agora e um Profissional cadastrado; os campos digitados a mao (rt_nome/rt_registro/rt_email/rt_fone) so aparecem em laudos salvos antes dessa mudanca. */
function resolverRt(state: ChuveirosState): { nome: string; registro: string; contato: string } {
  if (state.rt) {
    return {
      nome: state.rt.nome,
      registro: formatarRegistroProfissional({ nome: state.rt.nome, registroTipo: state.rt.registro_tipo, registroNumero: state.rt.registro_numero }),
      contato: [state.rt.email, state.rt.telefone].filter(Boolean).join(" "),
    };
  }
  return { nome: state.rt_nome ?? "", registro: state.rt_registro ?? "", contato: `${state.rt_email || ""} ${state.rt_fone || ""}`.trim() };
}

function desenharIdentificacao(doc: DocWithAutoTable, y: number, state: ChuveirosState): number {
  const rt = resolverRt(state);
  return desenharTabelaRotulos(doc, y, [
    [{ label: "Endereço", valor: `${state.endereco || ""}  Nº: ${state.numero || ""}  Complemento: ${state.complemento || ""}` }],
    [
      { label: "Bairro", valor: state.bairro || "" },
      { label: "Município-UF", valor: state.municipio_uf || "" },
    ],
    [{ label: "RE", valor: state.re || "" }],
    [
      { label: "Responsável pelo imóvel", valor: state.responsavel_imovel_nome || "" },
      { label: "E-mail/Fone", valor: `${state.responsavel_imovel_email || ""} ${state.responsavel_imovel_fone || ""}` },
    ],
    [
      { label: "Responsável Técnico", valor: rt.nome },
      { label: "Nº de registro", valor: rt.registro },
    ],
    [{ label: "E-mail/Fone do RT", valor: rt.contato }],
    [
      { label: "Ocupação (IN-01)", valor: state.ocupacao_in01 || "" },
      { label: "Ocupações (Tab. A-1 NBR 10.897)", valor: state.ocupacoes_nbr10897 || "" },
    ],
    [
      { label: "Válvula de Governo e Alarme nº", valor: state.vga_numero || "" },
      { label: "Sistema", valor: state.tipo_sistema || "" },
    ],
    [
      { label: "Risco", valor: state.risco || "" },
      { label: "Armazenamento", valor: state.classe_armazenamento || "" },
    ],
    [
      { label: "Método de armazenagem", valor: state.metodo_armazenagem || "" },
      { label: "Altura de armazenagem", valor: state.altura_armazenagem || "" },
    ],
    [{ label: "Altura da edificação", valor: state.altura_edificacao || "" }],
  ]);
}

function desenharConclusaoAssinaturas(doc: DocWithAutoTable, y: number, state: ChuveirosState): void {
  const rt = resolverRt(state);
  let cursorY = quebrarSeNecessario(doc, y, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Após a realização e verificação dos ensaios, o sistema se encontra em condição de operação: ${respostaTexto(state.conclusao)}`, margin, cursorY, {
    maxWidth: contentWidth,
  });
  cursorY += 8;
  const data = formatarDataBR(state.data_entrega_ou_inspecao);
  doc.text(`Data: ${data}`, margin, cursorY);
  cursorY += 10;

  doc.line(margin, cursorY, margin + 80, cursorY);
  cursorY += 5;
  if (state.nome_instalador) {
    doc.text(`Nome do instalador: ${state.nome_instalador}`, margin, cursorY);
    cursorY += 6;
  }
  doc.text(`Responsável Técnico (Assinatura Digital): ${rt.nome}`, margin, cursorY);
  cursorY += 6;
  doc.text(`Nº do Registro Profissional: ${rt.registro}`, margin, cursorY);
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

function nomeArquivo(state: ChuveirosState, sufixo: string): string {
  const nome = (state.cliente?.razao_social || "imovel").replace(/\s+/g, "_");
  return `${sufixo}_Chuveiros_Automaticos_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/** Gera o PDF do Anexo B (Relatório de Comissionamento do Sistema de Chuveiros Automáticos, IN 15/CBMSC). */
export async function gerarPdfComissionamentoChuveiros(state: ChuveirosState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoOficialCBMSC(doc, "ANEXO B — Relatório de Comissionamento do Sistema de Chuveiros Automáticos");
  y = desenharIdentificacao(doc, y, state);
  y += 5;

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Chuveiros automáticos", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(
    `Marca: ${state.chuveiros_marca || ""}   Modelo: ${state.chuveiros_modelo || ""}   Ano: ${state.chuveiros_ano || ""}   Orifício: ${state.chuveiros_orificio || ""}   Qtd: ${state.chuveiros_qtd || ""}   Temperatura: ${state.chuveiros_temperatura || ""}`,
    margin,
    y,
    { maxWidth: contentWidth }
  );
  y += 10;

  y = quebrarSeNecessario(doc, y, 60);
  doc.setFont("helvetica", "bold");
  doc.text("Ensaios principais", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const ensaiosB: [string, RespostaSN | undefined][] = [
    ["Instalação em conformidade com o projeto?", state.projeto_conformidade],
    ["Equipamento usado é aprovado?", state.equipamento_aprovado],
    ["Responsável instruído quanto à localização de válvulas e manutenção?", state.instrucao_realizada],
    ["Ensaio hidrostático em condição de operação?", state.ensaio_hidrostatico_ok],
    ["Os equipamentos funcionam adequadamente?", state.equipamentos_funcionam],
    ["Garantido que não foram empregados aditivos/produtos químicos corrosivos nos ensaios?", state.sem_aditivos_quimicos],
    ["Válvulas de controle totalmente abertas?", state.valvulas_controle_abertas],
    ["Conexões de mangueiras intercambiáveis com as do Corpo de Bombeiros?", state.conexoes_intercambiaveis],
  ];
  for (const [texto, resposta] of ensaiosB) {
    y = quebrarSeNecessario(doc, y, 6);
    const linhas = doc.splitTextToSize(`${texto} ${respostaTexto(resposta)}`, contentWidth);
    doc.text(linhas, margin, y);
    y += linhas.length * 5;
  }
  y += 3;

  if (state.divergencias) {
    const linhas = doc.splitTextToSize(`Divergências: ${state.divergencias}`, contentWidth);
    doc.text(linhas, margin, y);
    y += linhas.length * 5 + 5;
  }
  if (state.nome_responsavel_instruido) {
    doc.text(`Nome do responsável instruído: ${state.nome_responsavel_instruido}`, margin, y);
    y += 8;
  }

  if (state.memorial_tecnico_complementar) {
    y = quebrarSeNecessario(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.text("Memorial técnico complementar (ensaios hidrostáticos, soldagem, flush test etc.)", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const linhas = doc.splitTextToSize(state.memorial_tecnico_complementar, contentWidth);
    doc.text(linhas, margin, y);
    y += linhas.length * 5 + 8;
  }

  desenharConclusaoAssinaturas(doc, y, state);

  const fileName = nomeArquivo(state, "Anexo_B_Comissionamento");
  doc.save(fileName);
  return fileName;
}

/** Gera o PDF do Anexo C (Relatório de Inspeção do Sistema de Chuveiros Automáticos, IN 15/CBMSC). */
export async function gerarPdfInspecaoChuveiros(state: ChuveirosState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoOficialCBMSC(doc, "ANEXO C — Relatório de Inspeção do Sistema de Chuveiros Automáticos");
  y = desenharIdentificacao(doc, y, state);
  y += 5;

  const respostas = state.respostas || {};
  for (const secao of SECOES_CHUVEIROS) {
    y = desenharSecaoChecklist(doc, y, secao, respostas, false);
  }

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Relação dos chuveiros automáticos (tipo, fabricante, código, ano, tempo de resposta, posição, temperatura)", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const linhasChuv = doc.splitTextToSize(state.chuveiros_relacao || "-", contentWidth);
  doc.text(linhasChuv, margin, y);
  y += linhasChuv.length * 5 + 8;

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFont("helvetica", "bold");
  doc.text("Justificativas técnicas para não atendimento dos itens assinalados", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const linhasJust = doc.splitTextToSize(state.justificativas || "-", contentWidth);
  doc.text(linhasJust, margin, y);
  y += linhasJust.length * 5 + 8;

  y = quebrarSeNecessario(doc, y, 20);
  const textoAtesto =
    "Atesto, nesta data, que a instalação foi inspecionada e está em conformidade com as prescrições da NBR 10897 e da IN-15, estando o proprietário ou responsável pelo uso ciente de suas responsabilidades.";
  const linhasAtesto = doc.splitTextToSize(textoAtesto, contentWidth);
  doc.text(linhasAtesto, margin, y);
  y += linhasAtesto.length * 5 + 8;

  desenharConclusaoAssinaturas(doc, y, state);

  const fileName = nomeArquivo(state, "Anexo_C_Inspecao");
  doc.save(fileName);
  return fileName;
}
