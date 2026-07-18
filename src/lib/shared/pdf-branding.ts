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

// Margens ABNT (NBR 14724): superior/esquerda 3cm, inferior/direita 2cm.
export const MARGIN_TOP = 30;
export const MARGIN_LEFT = 30;
export const MARGIN_RIGHT = 20;
export const MARGIN_BOTTOM = 20;
export const PAGE_WIDTH = 210;
export const PAGE_HEIGHT = 297;
/** Ponto a partir do qual o conteudo deve quebrar de pagina, respeitando a margem inferior. */
export const PAGE_BREAK_Y = PAGE_HEIGHT - MARGIN_BOTTOM - 17;

export const COR_VERMELHO_ESCURO: [number, number, number] = [168, 29, 7];
export const COR_CINZA_INSTITUCIONAL: [number, number, number] = [100, 116, 139];

export async function carregarImagemComoDataUrl(url: string): Promise<{ dataUrl: string; format: string } | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const format = blob.type.includes("png") ? "PNG" : "JPEG";
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return { dataUrl, format };
  } catch {
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
  const logoH = 14;
  if (logo) {
    const props = doc.getImageProperties(logo.dataUrl);
    logoW = (props.width / props.height) * logoH;
    doc.addImage(logo.dataUrl, logo.format, MARGIN_LEFT, top, logoW, logoH);
  }

  const textX = MARGIN_LEFT + logoW + (logo ? 3 : 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("EZS Consultoria e Treinamentos LTDA", textX, top + logoH / 2 - 1);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text("CNPJ 20.544.712/0001-89", textX, top + logoH / 2 + 3);

  // Divisor fica no meio do espaco disponivel depois da logo, nao no centro da pagina —
  // assim os dados administrativos (esquerda) e os dados de endereco (direita) ficam com
  // a mesma largura, independente da largura da logo.
  const rightX = PAGE_WIDTH - MARGIN_RIGHT;
  const dividerX = (textX + rightX) / 2;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(dividerX, top + 1, dividerX, top + logoH - 1);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text("R. Hermes Zapelini, 513 - sala 02", rightX, top + 2, { align: "right" });
  doc.text("Barreiros, São José - SC, 88.110-050", rightX, top + 5.5, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("(48) 99141-2186  |  (48) 3093 6140", rightX, top + 9, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text("contato@scfire.com.br", rightX, top + 12.5, { align: "right" });

  const borderY = top + logoH + 4;
  doc.setDrawColor(...COR_VERMELHO_ESCURO);
  doc.setLineWidth(0.8);
  doc.line(MARGIN_LEFT, borderY, PAGE_WIDTH - MARGIN_RIGHT, borderY);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(title, PAGE_WIDTH / 2, borderY + 8, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text(subtitle + (codigoRef ? ` · ${codigoRef}` : ""), PAGE_WIDTH / 2, borderY + 14, { align: "center" });
  doc.setTextColor(0, 0, 0);

  return borderY + 22;
}
