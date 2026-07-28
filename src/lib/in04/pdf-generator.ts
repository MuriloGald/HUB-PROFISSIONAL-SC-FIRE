"use client";

/**
 * Gerador de PDF da Vistoria de Manutenção do SMSCI (IN 04) — cabeçalho com
 * identidade visual SC Fire (drawCabecalhoInstitucional, mesmo padrão do
 * módulo SAVE 23), estrutura narrativa inspirada no relatório de exemplo
 * ("VISTORIA SC-FIRE 011-2026 - COND AMADEUS.docx"), mas com o Escopo, os
 * Resultados por Pavimento e as Não Conformidades gerados dinamicamente a
 * partir dos itens realmente lançados no wizard, em vez de digitados à mão.
 */

import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import {
  drawCabecalhoInstitucional,
  desenharTabelaRotulos,
  carregarImagemComoDataUrl,
  COR_CINZA_INSTITUCIONAL,
  MARGIN_TOP,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  PAGE_WIDTH,
} from "../shared/pdf-branding";
import { quebrarSeNecessario, type DocWithAutoTable } from "../shared/checklist-pdf";
import { formatarDataBR, somarMeses } from "../shared/date-format";
import { CATEGORIAS_IN04, categoriaPorKey } from "./constants";
import type { CategoriaChecklist } from "./constants";
import type { CategoriaKey, EquipamentoVistoriado, VistoriaManutencaoState } from "./types";

applyPlugin(jsPDF);

const margin = MARGIN_LEFT;
const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

function nomeArquivo(state: VistoriaManutencaoState): string {
  const nome = (state.cliente?.razao_social || "imovel").replace(/\s+/g, "_");
  return `Vistoria_Manutencao_SMSCI_${state.codigo || "rascunho"}_${nome}.pdf`;
}

function categoriasComItens(state: VistoriaManutencaoState): CategoriaChecklist[] {
  return CATEGORIAS_IN04.filter((c) => state.pavimentos.some((p) => (p.itens[c.key] ?? []).length > 0));
}

function resumoConformidade(categoria: CategoriaChecklist, item: EquipamentoVistoriado): string {
  const respostas = Object.values(item.respostas);
  const naoConformidades = respostas.filter((r) => r.resposta === "nao").length;
  if (naoConformidades > 0) return `${naoConformidades} não conformidade(s)`;
  const respondidas = respostas.filter((r) => r.resposta === "sim" || r.resposta === "na").length;
  if (categoria.perguntas.length > 0 && respondidas >= categoria.perguntas.length) return "Conforme";
  return "Checklist incompleto";
}

function infoAcompanhamento(categoria: CategoriaChecklist, item: EquipamentoVistoriado): string {
  const partes: string[] = [];
  for (const pergunta of categoria.perguntas) {
    if (!pergunta.exigeAcompanhamento) continue;
    const resposta = item.respostas[pergunta.chave];
    if (!resposta?.dataAcompanhamento && !resposta?.numeroDrt) continue;
    const rotulo = pergunta.tipoAcompanhamento === "drt" ? "DRT" : "Validade";
    const drt = pergunta.tipoAcompanhamento === "drt" && resposta.numeroDrt ? ` ${resposta.numeroDrt}` : "";
    const venc = pergunta.periodicidadeMeses && resposta.dataAcompanhamento ? ` (próx. ${somarMeses(resposta.dataAcompanhamento, pergunta.periodicidadeMeses)})` : "";
    partes.push(`${rotulo}${drt}${venc}`);
  }
  return partes.join("; ");
}

function desenharTituloSecao(doc: DocWithAutoTable, y: number, texto: string, fontSize = 11): number {
  const cursorY = quebrarSeNecessario(doc, y, 12);
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(texto, margin, cursorY);
  return cursorY + 6;
}

function desenharParagrafo(doc: DocWithAutoTable, y: number, texto: string): number {
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  const linhas: string[] = doc.splitTextToSize(texto, contentWidth);
  const cursorY = quebrarSeNecessario(doc, y, linhas.length * 4.6);
  doc.text(linhas, margin, cursorY);
  return cursorY + linhas.length * 4.6 + 4;
}

function desenharTabelaEquipamentos(doc: DocWithAutoTable, y: number, categoria: CategoriaChecklist, equipamentos: EquipamentoVistoriado[]): number {
  let cursorY = quebrarSeNecessario(doc, y, 14 + equipamentos.length * 7);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`${categoria.titulo} (${categoria.normaRef})`, margin, cursorY);
  cursorY += 3;

  const body = equipamentos.map((item) => [item.identificacao || "-", resumoConformidade(categoria, item), infoAcompanhamento(categoria, item) || "-"]);

  doc.autoTable({
    startY: cursorY,
    theme: "grid",
    head: [[categoria.labelIdentificacao, "Situação", "Vencimento / DRT"]],
    body,
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold", halign: "center", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 1.8, textColor: 0, lineColor: 0, lineWidth: 0.2, valign: "middle" },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.4 },
      1: { cellWidth: contentWidth * 0.28, halign: "center" },
      2: { cellWidth: contentWidth * 0.32, halign: "center" },
    },
    margin: { left: margin, right: MARGIN_RIGHT },
  });

  return doc.lastAutoTable.finalY + 6;
}

interface NaoConformidade {
  pavimento: string;
  categoria: string;
  identificacao: string;
  pergunta: string;
}

function coletarNaoConformidades(state: VistoriaManutencaoState): NaoConformidade[] {
  const lista: NaoConformidade[] = [];
  for (const pavimento of state.pavimentos) {
    for (const key of Object.keys(pavimento.itens) as CategoriaKey[]) {
      const categoria = categoriaPorKey(key);
      for (const item of pavimento.itens[key] ?? []) {
        for (const pergunta of categoria.perguntas) {
          if (item.respostas[pergunta.chave]?.resposta === "nao") {
            lista.push({ pavimento: pavimento.nome || "-", categoria: categoria.titulo, identificacao: item.identificacao || "-", pergunta: pergunta.texto });
          }
        }
      }
    }
  }
  return lista;
}

/** Fotos anexadas em todos os itens vistoriados, sempre a partir de uma página nova — anexo do relatório. */
async function drawFotosAnexadas(doc: DocWithAutoTable, state: VistoriaManutencaoState): Promise<void> {
  const imagens: { url: string; legenda?: string }[] = [];
  for (const pavimento of state.pavimentos) {
    for (const key of Object.keys(pavimento.itens) as CategoriaKey[]) {
      const categoria = categoriaPorKey(key);
      for (const item of pavimento.itens[key] ?? []) {
        for (const img of item.imagens) {
          imagens.push({ url: img.url, legenda: img.legenda || `${categoria.titulo} — ${item.identificacao} (${pavimento.nome})` });
        }
      }
    }
  }
  if (imagens.length === 0) return;

  doc.addPage();
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("FOTOS", margin, MARGIN_TOP + 10);
  let cursorY = MARGIN_TOP + 20;

  const w = 100;
  const h = 65;
  let n = 1;
  for (const img of imagens) {
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
}

/** Gera o PDF da Vistoria de Manutenção do SMSCI (IN 04) e dispara o download. */
export async function gerarPdfVistoriaManutencao(state: VistoriaManutencaoState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoInstitucional(doc, "RELATÓRIO DE VISTORIA TÉCNICA", "Avaliação de Conformidade dos SMSCI — IN 04/CBMSC", state.codigo);

  const c = state.cliente;
  y = desenharTabelaRotulos(doc, y, [
    [{ label: "Cliente", valor: c?.razao_social || "" }],
    [
      { label: "CNPJ/CPF", valor: c?.cnpj || c?.cpf || "" },
      { label: "RE", valor: c?.re || "" },
    ],
    [{ label: "Localização", valor: [c?.logradouro, c?.numero, c?.bairro, c?.cidade && c?.estado ? `${c.cidade}/${c.estado}` : c?.cidade].filter(Boolean).join(", ") }],
    [
      { label: "Data da vistoria", valor: formatarDataBR(state.data_vistoria) },
      { label: "Vistoriador", valor: state.vistoriador || "" },
    ],
    [
      { label: "Responsável Técnico", valor: state.rt_nome || "" },
      { label: "Nº de registro", valor: state.rt_registro || "" },
    ],
  ]);
  y += 5;

  const categoriasPresentes = categoriasComItens(state);
  const totalNaoConformidades = coletarNaoConformidades(state);

  y = desenharTituloSecao(doc, y, "1. Introdução");
  y = desenharParagrafo(
    doc,
    y,
    "Este documento apresenta os resultados da vistoria técnica realizada nas dependências do imóvel, visando auditar a conformidade operacional e o estado de manutenção dos Sistemas e Medidas de Segurança Contra Incêndio (SMSCI) instalados frente ao Projeto Preventivo Contra Incêndio (PPCI) aprovado e à realidade física da edificação na data presente."
  );

  y = desenharTituloSecao(doc, y, "2. Objetivo e Referencial Normativo");
  y = desenharParagrafo(
    doc,
    y,
    "A vistoria objetiva atestar a existência, integridade e funcionalidade dos sistemas preventivos através de inspeção visual e testes de campo. O balizamento técnico segue as Instruções Normativas do Corpo de Bombeiros Militar de Santa Catarina (CBMSC), especificamente a IN 04 (Manutenção), complementada pelas Instruções Normativas específicas de cada sistema."
  );

  y = desenharTituloSecao(doc, y, "3. Escopo dos Sistemas Inspecionados");
  if (categoriasPresentes.length === 0) {
    y = desenharParagrafo(doc, y, "Nenhum sistema foi lançado nesta vistoria.");
  } else {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    for (const categoria of categoriasPresentes) {
      y = quebrarSeNecessario(doc, y, 6);
      doc.text(`•  ${categoria.titulo} (${categoria.normaRef})`, margin, y);
      y += 5.5;
    }
    y += 2;
  }

  y = desenharTituloSecao(doc, y, "4. Resultados por Pavimento");
  if (state.pavimentos.every((p) => Object.values(p.itens).every((arr) => arr.length === 0))) {
    y = desenharParagrafo(doc, y, "Nenhum item foi lançado em nenhum pavimento.");
  }
  for (const pavimento of state.pavimentos) {
    const categoriasDoPavimento = CATEGORIAS_IN04.filter((c) => (pavimento.itens[c.key] ?? []).length > 0);
    if (categoriasDoPavimento.length === 0) continue;
    y = desenharTituloSecao(doc, y, pavimento.nome || "Pavimento", 10);
    for (const categoria of categoriasDoPavimento) {
      y = desenharTabelaEquipamentos(doc, y, categoria, pavimento.itens[categoria.key]);
    }
  }

  y = desenharTituloSecao(doc, y, "5. Não Conformidades Identificadas");
  if (totalNaoConformidades.length === 0) {
    y = desenharParagrafo(doc, y, "Nenhuma não conformidade identificada nesta vistoria.");
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    for (const nc of totalNaoConformidades) {
      const linhas: string[] = doc.splitTextToSize(`•  [${nc.pavimento} · ${nc.categoria} · ${nc.identificacao}] ${nc.pergunta}`, contentWidth);
      y = quebrarSeNecessario(doc, y, linhas.length * 4.6);
      doc.text(linhas, margin, y);
      y += linhas.length * 4.6 + 1.5;
    }
    y += 3;
  }

  y = desenharTituloSecao(doc, y, "6. Conclusão de Conformidade");
  const dataVistoriaFormatada = formatarDataBR(state.data_vistoria) || "acima indicada";
  const textoConclusao =
    totalNaoConformidades.length === 0
      ? `Com base nos dados coletados, conclui-se que, na data da vistoria (${dataVistoriaFormatada}), o imóvel ${c?.razao_social || ""} apresentava seus SMSCI em pleno estado de conformidade com as normas vigentes do CBMSC (IN 04).`
      : `Com base nos dados coletados, conclui-se que, na data da vistoria (${dataVistoriaFormatada}), foram identificadas ${totalNaoConformidades.length} pendência(s) de conformidade nos SMSCI do imóvel ${c?.razao_social || ""}, relacionadas na seção 5 deste relatório. Recomenda-se a regularização das pendências dentro dos prazos previstos nas Instruções Normativas do CBMSC aplicáveis a cada sistema.`;
  y = desenharParagrafo(doc, y, textoConclusao);

  // Ressalva de auto-defesa jurídica: a conformidade atestada é uma fotografia do
  // momento da vistoria, não uma garantia contínua — a manutenção do estado
  // verificado é responsabilidade do proprietário/responsável pelo uso a partir daí.
  y = desenharParagrafo(
    doc,
    y,
    `Esta conclusão reflete exclusivamente o estado dos SMSCI verificado na data e no momento da vistoria acima indicada (${dataVistoriaFormatada}), não constituindo garantia de conformidade em data anterior ou posterior a essa. A manutenção da conformidade ao longo do tempo, bem como a operacionalidade e a realização das manutenções e vistorias periódicas previstas nas Instruções Normativas do CBMSC aplicáveis a cada sistema, são de responsabilidade exclusiva do proprietário e/ou do responsável pelo uso do imóvel.`
  );

  if (state.observacoesGerais) {
    y = desenharTituloSecao(doc, y, "Observações Gerais");
    y = desenharParagrafo(doc, y, state.observacoesGerais);
  }

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const dataEmissao = state.data_emissao ? new Date(state.data_emissao).toLocaleDateString("pt-BR") : "";
  doc.text(`Florianópolis, ${dataEmissao}.`, margin, y);
  y += 20;

  y = quebrarSeNecessario(doc, y, 20);
  doc.line(margin, y, margin + 80, y);
  doc.text(state.vistoriador || "", margin, y + 5);
  doc.setFontSize(8);
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text("Vistoriador", margin, y + 9);

  const x2 = margin + contentWidth - 80;
  doc.setDrawColor(0, 0, 0);
  doc.line(x2, y, x2 + 80, y);
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(state.rt_nome || "", x2, y + 5);
  doc.setFontSize(8);
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text(`Responsável Técnico${state.rt_registro ? ` — ${state.rt_registro}` : ""}`, x2, y + 9);

  await drawFotosAnexadas(doc, state);

  const fileName = nomeArquivo(state);
  doc.save(fileName);
  return fileName;
}
