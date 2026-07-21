"use client";

/**
 * Cabeçalho institucional compartilhado por qualquer gerador de PDF do hub —
 * logo + EZS Consultoria (esquerda), divisor, endereço/contato (direita),
 * borda inferior vermelho-institucional. Segue Identidade Visual/mostruario.html
 * (aba "Padrão de Laudo PDF"), a mesma marcação de identidade-visual/page.tsx.
 *
 * Usado pelo gerador do módulo SAVE 23 (que já é 100% "identidade SC Fire") e,
 * opcionalmente, pelo gerador de Eventos (IN 24) para uma segunda via com marca —
 * o laudo oficial enviado ao CBMSC continua no padrão do formulário, sem logo.
 */

import type { jsPDF } from "jspdf";

// Margens ABNT (NBR 14724): esquerda 3cm, inferior/direita 2cm. Margem superior
// reduzida pela metade (1,5cm) a pedido — menor que o padrao ABNT estrito.
export const MARGIN_TOP = 15;
export const MARGIN_LEFT = 30;
export const MARGIN_RIGHT = 20;
// O cabecalho (logo + divisor + borda) usa uma margem esquerda propria, mais estreita
// que a margem ABNT do corpo do documento — pedido explicito pra dar mais espaco a
// logo/dados institucionais sem alterar o recuo do texto/tabelas abaixo da borda.
export const MARGIN_LEFT_CABECALHO = 20;
export const MARGIN_BOTTOM = 20; // 2,0cm
export const PAGE_WIDTH = 210;
export const PAGE_HEIGHT = 297;
/**
 * Ponto a partir do qual o conteudo deve quebrar de pagina, respeitando a margem
 * inferior de 2,0cm (PAGE_HEIGHT - MARGIN_BOTTOM = 277mm). A folga de 10mm antes
 * disso e so pra dar espaco pro bloco de conteudo que esta prestes a ser desenhado
 * (um par de linhas, uma pequena tabela) nao ultrapassar a margem real.
 */
export const PAGE_BREAK_Y = PAGE_HEIGHT - MARGIN_BOTTOM - 10;

export const COR_VERMELHO_ESCURO: [number, number, number] = [168, 29, 7];
export const COR_CINZA_INSTITUCIONAL: [number, number, number] = [100, 116, 139];

/**
 * Busca a imagem e a redesenha via <canvas> antes de virar data URL — o jsPDF
 * embute os bytes originais sem transcodificar, então se o arquivo for WEBP,
 * HEIC (foto de iPhone) ou qualquer coisa diferente do rótulo "PNG"/"JPEG" que
 * a gente adivinhava do blob.type, o addImage() não dá erro mas o PDF fica com
 * um espaço em branco onde a foto deveria estar (o visualizador de PDF não
 * decodifica os bytes crus errados). Passando pelo canvas, o próprio navegador
 * decodifica a imagem (em qualquer formato que ele suporte) e a gente sempre
 * re-exporta como PNG — daí o jsPDF recebe bytes que batem com o rótulo.
 */
export async function carregarImagemComoDataUrl(url: string): Promise<{ dataUrl: string; format: string } | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context indisponível");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return { dataUrl: canvas.toDataURL("image/png"), format: "PNG" };
  } catch (err) {
    console.error(`Não consegui carregar a imagem para o PDF: ${url}`, err);
    return null;
  }
}

let logoCache: { dataUrl: string; format: string } | null | undefined;

export async function carregarLogoScFire(): Promise<{ dataUrl: string; format: string } | null> {
  if (logoCache === undefined) {
    logoCache = await carregarImagemComoDataUrl("/logo-sc-fire.png");
  }
  return logoCache;
}

/** Desenha o cabeçalho institucional completo e devolve o Y onde o conteúdo do documento deve começar. */
export async function drawCabecalhoInstitucional(doc: jsPDF, title: string, subtitle: string, codigoRef?: string): Promise<number> {
  const top = MARGIN_TOP;
  const logo = await carregarLogoScFire();

  let logoW = 0;
  const logoH = 28 * (2 / 3); // ~18,7mm — 2/3 do tamanho anterior
  if (logo) {
    const props = doc.getImageProperties(logo.dataUrl);
    logoW = (props.width / props.height) * logoH;
    doc.addImage(logo.dataUrl, logo.format, MARGIN_LEFT_CABECALHO, top, logoW, logoH);
  }

  // Texto do lado da logo comeca 10mm mais abaixo do topo da logo — a logo fica
  // visivelmente "acima" do texto em vez dos dois comecarem alinhados no mesmo topo.
  const textX = MARGIN_LEFT_CABECALHO + logoW + (logo ? 3 : 0);
  const textTop = top + 10;
  const rightX = PAGE_WIDTH - MARGIN_RIGHT;
  const dividerX = (textX + rightX) / 2;
  const larguraDisponivelTexto = dividerX - textX - 2;

  doc.setFont("helvetica", "bold");
  let fonteEmpresa = 9;
  doc.setFontSize(fonteEmpresa);
  while (doc.getTextWidth("EZS Consultoria e Treinamentos LTDA") > larguraDisponivelTexto && fonteEmpresa > 6.5) {
    fonteEmpresa -= 0.5;
    doc.setFontSize(fonteEmpresa);
  }
  doc.setTextColor(0, 0, 0);
  doc.text("EZS Consultoria e Treinamentos LTDA", textX, textTop);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text("CNPJ 20.544.712/0001-89", textX, textTop + 4);

  // Divisor fica no meio do espaco disponivel depois da logo, nao no centro da pagina —
  // assim os dados administrativos (esquerda) e os dados de endereco (direita) ficam com
  // a mesma largura, independente da largura da logo.
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(dividerX, top + 1, dividerX, top + Math.max(logoH, 12) - 1);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text("R. Hermes Zapelini, 513 - sala 02", rightX, top + 5.5, { align: "right" });
  doc.text("Barreiros, São José - SC, 88.110-050", rightX, top + 9, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("(48) 99141-2186  |  (48) 3093 6140", rightX, top + 12.5, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text("contato@scfire.com.br", rightX, top + 16, { align: "right" });

  const borderY = top + Math.max(logoH, 12) + 4;
  doc.setDrawColor(...COR_VERMELHO_ESCURO);
  doc.setLineWidth(0.8);
  doc.line(MARGIN_LEFT_CABECALHO, borderY, PAGE_WIDTH - MARGIN_RIGHT, borderY);

  // Titulos longos nao cabem numa linha centralizada na largura da pagina inteira —
  // "centralizar" um texto mais largo que o conteudo estoura a margem esquerda e
  // parece desalinhado. Quebra em quantas linhas forem necessarias, cada uma centrada
  // na area de conteudo (nao na pagina inteira).
  const tituloContentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  const linhasTitulo: string[] = doc.splitTextToSize(title, tituloContentWidth);
  let tituloY = borderY + 8;
  for (const linha of linhasTitulo) {
    doc.text(linha, PAGE_WIDTH / 2, tituloY, { align: "center" });
    tituloY += 6;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text(subtitle + (codigoRef ? ` · ${codigoRef}` : ""), PAGE_WIDTH / 2, tituloY, { align: "center" });
  doc.setTextColor(0, 0, 0);

  return tituloY + 8;
}

/**
 * Cabeçalho OFICIAL do CBMSC — usado nos "preenchíveis" (formulários/anexos das
 * Instruções Normativas) que vão para o órgão. Nada de identidade visual SC
 * Fire aqui: é o mastro institucional que aparece em todo anexo do CBMSC
 * ("ESTADO DE SANTA CATARINA / SECRETARIA DE ESTADO DA SEGURANÇA PÚBLICA /
 * CORPO DE BOMBEIROS MILITAR DE SANTA CATARINA"), confirmado lendo os .docx
 * originais (IN 01 Anexo I/J). Documentos SC-Fire-branded (Plano de Ensino,
 * segunda via de Eventos, etc.) continuam usando drawCabecalhoInstitucional.
 */
export function drawCabecalhoOficialCBMSC(doc: jsPDF, titulo: string): number {
  const top = MARGIN_TOP;
  const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("ESTADO DE SANTA CATARINA", PAGE_WIDTH / 2, top, { align: "center" });
  doc.text("SECRETARIA DE ESTADO DA SEGURANÇA PÚBLICA", PAGE_WIDTH / 2, top + 5, { align: "center" });
  doc.text("CORPO DE BOMBEIROS MILITAR DE SANTA CATARINA", PAGE_WIDTH / 2, top + 10, { align: "center" });

  const borderY = top + 14;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(MARGIN_LEFT, borderY, PAGE_WIDTH - MARGIN_RIGHT, borderY);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  const linhas: string[] = doc.splitTextToSize(titulo, contentWidth);
  let y = borderY + 7;
  for (const linha of linhas) {
    doc.text(linha, PAGE_WIDTH / 2, y, { align: "center" });
    y += 5.5;
  }

  doc.setFont("helvetica", "normal");
  return y + 3;
}

export interface CelulaRotulo {
  label: string;
  valor: string;
}

/**
 * Desenha uma tabela de N colunas onde cada célula é "Rótulo: valor", com o
 * rótulo em negrito e o valor em peso normal — jspdf-autotable não suporta
 * negrito parcial dentro de uma célula, então essa tabela é desenhada na mão
 * (borda + texto), com o próprio wrap de texto calculado aqui. Compartilhada
 * por todos os geradores de PDF do hub (SAVE 23, Eventos, Plano de Ensino,
 * Habite-se) pra manter o mesmo padrão visual de tabela de identificação.
 */
export function desenharTabelaRotulos(
  doc: jsPDF,
  startY: number,
  linhas: CelulaRotulo[][],
  contentWidth: number = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
  margin: number = MARGIN_LEFT
): number {
  const padding = 2.5;
  const lineHeight = 4.6;
  const fontSize = 9;
  const corTextoNormal: [number, number, number] = [55, 65, 81];
  let y = startY;

  for (const linha of linhas) {
    // Cada linha pode ter seu proprio numero de colunas (ex: uma linha de largura
    // total seguida de uma linha com 2 colunas) — a largura da coluna e recalculada
    // por linha em vez de fixada pela primeira.
    const numCols = linha.length || 1;
    const largura = contentWidth / numCols;
    doc.setFontSize(fontSize);
    const celulas = linha.map((c) => {
      const colWidth = largura - padding * 2;
      doc.setFont("helvetica", "bold");
      const rotuloTexto = `${c.label}: `;
      const rotuloWidth = doc.getTextWidth(rotuloTexto);
      doc.setFont("helvetica", "normal");
      const palavras = c.valor.split(" ");
      const linhasCelula: string[] = [];
      let atual = "";
      palavras.forEach((palavra, idx) => {
        const testeTexto = atual ? `${atual} ${palavra}` : palavra;
        const larguraDisponivel = linhasCelula.length === 0 ? colWidth - rotuloWidth : colWidth;
        if (atual && doc.getTextWidth(testeTexto) > larguraDisponivel) {
          linhasCelula.push(atual);
          atual = palavra;
        } else {
          atual = testeTexto;
        }
        if (idx === palavras.length - 1 && atual) linhasCelula.push(atual);
      });
      if (!linhasCelula.length) linhasCelula.push("");
      return { rotulo: rotuloTexto, rotuloWidth, linhas: linhasCelula };
    });

    const maxLinhas = Math.max(...celulas.map((c) => c.linhas.length), 1);
    const rowHeight = maxLinhas * lineHeight + padding * 2;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    let x = margin;
    for (let i = 0; i < numCols; i++) {
      doc.rect(x, y, largura, rowHeight);
      x += largura;
    }

    x = margin;
    for (let i = 0; i < numCols; i++) {
      const cel = celulas[i];
      let ty = y + padding + 3.2;
      cel.linhas.forEach((texto, idx) => {
        doc.setFontSize(fontSize);
        if (idx === 0) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(cel.rotulo, x + padding, ty);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...corTextoNormal);
          doc.text(texto, x + padding + cel.rotuloWidth, ty);
        } else {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...corTextoNormal);
          doc.text(texto, x + padding, ty);
        }
        ty += lineHeight;
      });
      x += largura;
    }
    doc.setTextColor(0, 0, 0);
    y += rowHeight;
  }

  return y;
}
