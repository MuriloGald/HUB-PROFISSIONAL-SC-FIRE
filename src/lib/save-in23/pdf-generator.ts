"use client";

/**
 * Gerador de PDF do modulo SAVE 23 (Vistoria de Campo + Laudo Tecnico), usando
 * jsPDF + jsPDF-AutoTable — mesmo motor do modulo de Laudos de Eventos.
 * Porta htmlRelatorioVistoria_() e htmlLaudo_() do app legado "App Vistoria e Laudo".
 *
 * Diferenca em relacao ao gerador de eventos: este modulo tem upload de imagens
 * (Supabase Storage), entao a geracao e assincrona — as imagens sao buscadas e
 * convertidas para data URL antes de serem embutidas via doc.addImage().
 */

import { jsPDF } from "jspdf";
import { applyPlugin, type RowInput } from "jspdf-autotable";
import { RESPONSAVEIS_TECNICOS } from "./constants";
import { avaliarSetor } from "./classificador";
import { carregarImagemComoDataUrl, drawCabecalhoInstitucional, COR_VERMELHO_ESCURO, COR_CINZA_INSTITUCIONAL } from "../shared/pdf-branding";
import type { ClienteSave23Snapshot, Imagem, LaudoTecnicoWizardState, SetorVistoria, VistoriaWizardState } from "./types";

applyPlugin(jsPDF);

type DocWithAutoTable = jsPDF & {
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable: { finalY: number };
};

const margin = 14;
const pageWidth = 210;
const contentWidth = pageWidth - margin * 2;

// Cores de status (Identidade Visual/mostruario.html) — vermelho/cinza institucionais
// vêm do cabeçalho compartilhado em lib/shared/pdf-branding.
const COR_VERDE: [number, number, number] = [16, 185, 129];
const COR_VERMELHO: [number, number, number] = [239, 68, 68];
const COR_AMBAR: [number, number, number] = [245, 158, 11];
const COR_CINZA = COR_CINZA_INSTITUCIONAL;
const COR_LABEL_BG: [number, number, number] = [248, 250, 252];

function corResultado(resultado: string): [number, number, number] {
  if (resultado === "DISPENSADO") return COR_VERDE;
  if (resultado === "PBD EXIGIDO") return COR_VERMELHO;
  return COR_CINZA;
}

function corPossivel(possivel: boolean | "financeiro" | undefined): [number, number, number] {
  if (possivel === true) return COR_VERDE;
  if (possivel === false) return COR_VERMELHO;
  if (possivel === "financeiro") return COR_AMBAR;
  return COR_CINZA;
}

function textoPossivel(possivel: boolean | "financeiro" | undefined): string {
  if (possivel === true) return "SIM";
  if (possivel === false) return "NÃO";
  if (possivel === "financeiro") return "INVIÁVEL (FINANCEIRO)";
  return "—";
}

/** Cabeçalho institucional (logo + EZS Consultoria + contato) — ver lib/shared/pdf-branding. */
async function drawHeader(doc: DocWithAutoTable, title: string, subtitle: string, codigo?: string): Promise<number> {
  return drawCabecalhoInstitucional(doc, title, subtitle, codigo ? `RG ${codigo}` : undefined);
}

async function embutirImagens(doc: DocWithAutoTable, imagens: Imagem[], startY: number): Promise<number> {
  let y = startY;
  for (let i = 0; i < imagens.length; i++) {
    const img = imagens[i];
    const carregada = await carregarImagemComoDataUrl(img.url);
    if (y > 230) {
      doc.addPage();
      y = margin + 10;
    }
    if (!carregada) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...COR_VERMELHO);
      doc.text(`[Imagem indisponível: ${img.legenda || img.url}]`, margin, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
      continue;
    }
    const w = 100;
    const h = 65;
    doc.addImage(carregada.dataUrl, carregada.format, margin, y, w, h, undefined, "MEDIUM");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COR_CINZA);
    doc.text(`Imagem ${String(i + 1).padStart(2, "0")}${img.legenda ? ` – ${img.legenda}` : ""}`, margin, y + h + 4);
    doc.setTextColor(0, 0, 0);
    y += h + 10;
  }
  return y;
}

/* ============================================================
 * VISTORIA DE CAMPO
 * ============================================================ */

function drawIdentificacaoVistoria(doc: DocWithAutoTable, startY: number, state: VistoriaWizardState): number {
  const c = (state.cliente || {}) as ClienteSave23Snapshot;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. IDENTIFICAÇÃO DA EDIFICAÇÃO", margin, startY);

  const body: RowInput[] = [
    [`Nome da edificação: ${c.razao_social || ""}`, `RE: ${c.re || ""}`],
    [`Endereço: ${c.logradouro || ""}, ${c.numero || ""}`, `Município: ${c.cidade || ""} / ${c.estado || "SC"}`],
    [`Responsável pelo imóvel: ${c.nome_responsavel || ""}`, `Responsável Técnico: ${state.respTecnico || ""}`],
    [`Vistoriador: ${state.vistoriador || ""}`, `Edificação preexistente: ${c.preexistente ? "Sim" : "Não"}`],
  ];

  doc.autoTable({
    startY: startY + 3,
    theme: "grid",
    head: [],
    body,
    styles: { fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 200, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth / 2 }, 1: { cellWidth: contentWidth / 2 } },
  });

  return doc.lastAutoTable.finalY + 10;
}

function drawResumoSetores(doc: DocWithAutoTable, startY: number, setores: SetorVistoria[], preexistente: boolean | undefined): number {
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("2. QUADRO-RESUMO DOS SETORES AVALIADOS", margin, startY);

  const head = [["Setor", "Vagas SAVE", "Ocupação", "Resultado"]];
  const body = setores.map((s, i) => {
    const av = avaliarSetor(s, preexistente);
    return [
      `${i + 1}. ${s.nome}`,
      s.vagas || "—",
      s.ocupacao || "—",
      av.resultado + (av.enquadramento ? ` — Inciso ${av.enquadramento}` : ""),
    ];
  });

  doc.autoTable({
    startY: startY + 3,
    theme: "grid",
    head,
    body,
    headStyles: { fillColor: COR_LABEL_BG, textColor: 0, fontStyle: "bold", halign: "center", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2, textColor: 0, lineColor: 200, lineWidth: 0.2 },
    columnStyles: { 1: { halign: "center" }, 2: { halign: "center" } },
  });

  return doc.lastAutoTable.finalY + 6;
}

async function drawSetorAnexo(doc: DocWithAutoTable, s: SetorVistoria, index: number, state: VistoriaWizardState): Promise<void> {
  doc.addPage();
  const c = (state.cliente || {}) as ClienteSave23Snapshot;
  const av = avaliarSetor(s, c.preexistente);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`ANEXO ${index + 1} — DETALHAMENTO DO SETOR: ${s.nome.toUpperCase()}`, margin, margin + 8);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_CINZA);
  doc.text(`Edificação: ${c.razao_social || ""}${c.re ? ` · RE: ${c.re}` : ""}`, margin, margin + 13);
  doc.setTextColor(0, 0, 0);

  let y = margin + 18;

  doc.autoTable({
    startY: y,
    theme: "grid",
    head: [],
    body: [
      [`Nº de vagas com SAVE: ${s.vagas || ""}`, `Ocupação: ${s.ocupacao || ""}`],
      [`Área do ambiente: ${s.areaTotal || ""} m²`, `Área por pavimento: ${s.areaPavimento || ""} m²`],
    ],
    styles: { fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 200, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth / 2 }, 1: { cellWidth: contentWidth / 2 } },
  });
  y = doc.lastAutoTable.finalY + 4;

  const sn = (v: boolean | undefined) => (v === true ? "SIM" : v === false ? "NÃO" : "—");
  const corSn = (v: boolean | undefined): [number, number, number] => (v === true ? COR_VERDE : v === false ? COR_VERMELHO : COR_CINZA);

  const linhas: RowInput[] = [
    ["Local externo/descoberto ou com cobertura leve (inciso I)", { content: sn(s.externo), styles: { textColor: corSn(s.externo) } }],
    ["Detecção automática de incêndio (IN 12)", { content: sn(s.deteccao), styles: { textColor: corSn(s.deteccao) } }],
    ["Extração mecânica de fumaça (IN 10)", { content: sn(s.extracao), styles: { textColor: corSn(s.extracao) } }],
    ["Ventilação natural — aberturas em pelo menos 2 lados", { content: sn(s.ventilacao.doisLados), styles: { textColor: corSn(s.ventilacao.doisLados) } }],
    [
      `Área das aberturas / área da fachada (§1º, I — mín. 20%)`,
      {
        content: av.ventilacao.pctArea !== null ? `${av.ventilacao.pctArea.toFixed(1)}%` : "—",
        styles: { textColor: av.ventilacao.pctArea !== null && av.ventilacao.pctArea >= 20 ? COR_VERDE : COR_VERMELHO },
      },
    ],
    [
      `Comprimento das aberturas / perímetro do pavimento (§1º, II — mín. 40%)`,
      {
        content: av.ventilacao.pctPerimetro !== null ? `${av.ventilacao.pctPerimetro.toFixed(1)}%` : "—",
        styles: { textColor: av.ventilacao.pctPerimetro !== null && av.ventilacao.pctPerimetro >= 40 ? COR_VERDE : COR_VERMELHO },
      },
    ],
    ["Ventilação natural atende integralmente ao § 1º", { content: sn(av.ventilacao.ok), styles: { textColor: corSn(av.ventilacao.ok) } }],
    ["Chuveiros automáticos (IN 15)", { content: sn(s.sprinklerIN15), styles: { textColor: corSn(s.sprinklerIN15) } }],
    ["§ 2º — chave de fluxo interligada ao alarme", { content: sn(s.hidChaveFluxo), styles: { textColor: corSn(s.hidChaveFluxo) } }],
    ["§ 2º — ponto de dreno e teste", { content: sn(s.hidDreno), styles: { textColor: corSn(s.hidDreno) } }],
    ["§ 2º — manômetro visível", { content: sn(s.hidManometro), styles: { textColor: corSn(s.hidManometro) } }],
    ["Compartimentação em relação às rotas de fuga (III, a)", { content: sn(s.compartRotas), styles: { textColor: corSn(s.compartRotas) } }],
    ["Compartimentação em relação às saídas de emergência (IV, b)", { content: sn(s.compartSaidas), styles: { textColor: corSn(s.compartSaidas) } }],
    ["Compartimentação entre ambientes SAVE, TRF mínimo de 1h (§ 5º)", { content: sn(s.compartEntreSave), styles: { textColor: corSn(s.compartEntreSave) } }],
  ];

  doc.autoTable({
    startY: y,
    theme: "grid",
    head: [["Item verificado", "Resposta"]],
    body: linhas,
    headStyles: { fillColor: COR_LABEL_BG, textColor: 0, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 1.8, textColor: 0, lineColor: 200, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth * 0.72 }, 1: { cellWidth: contentWidth * 0.28, halign: "center", fontStyle: "bold" } },
  });
  y = doc.lastAutoTable.finalY + 5;

  if (y > 250) {
    doc.addPage();
    y = margin + 10;
  }

  const cor = corResultado(av.resultado);
  doc.setDrawColor(...cor);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...cor);
  doc.text(av.resultado + (av.enquadramento ? ` — Inciso ${av.enquadramento}` : ""), margin + 4, y + 10);
  doc.setTextColor(0, 0, 0);
  y += 22;

  if (s.alteracoes.length || s.altObs) {
    if (y > 240) {
      doc.addPage();
      y = margin + 10;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COR_AMBAR);
    doc.text("PLANO DE ADEQUAÇÕES — alterações possíveis para viabilizar a dispensa do PBD", margin, y);
    doc.setTextColor(0, 0, 0);
    y += 3;

    if (s.alteracoes.length) {
      doc.autoTable({
        startY: y,
        theme: "grid",
        head: [["Alteração avaliada em campo", "Viável?"]],
        body: s.alteracoes.map((a) => [
          `É possível a instalação de ${a.label}?`,
          { content: textoPossivel(a.possivel), styles: { textColor: corPossivel(a.possivel), fontStyle: "bold" } },
        ]),
        headStyles: { fillColor: COR_LABEL_BG, textColor: 0, fontStyle: "bold", fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 1.8, textColor: 0, lineColor: 200, lineWidth: 0.2 },
        columnStyles: { 1: { halign: "center", cellWidth: 45 } },
      });
      y = doc.lastAutoTable.finalY + 4;
    }

    if (s.altObs) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const linhasTexto = doc.splitTextToSize(`Detalhes das adequações propostas: ${s.altObs}`, contentWidth);
      doc.text(linhasTexto, margin, y);
      y += linhasTexto.length * 4 + 4;
    }
  }

  if (s.observacoes) {
    if (y > 250) {
      doc.addPage();
      y = margin + 10;
    }
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Observações do setor:", margin, y);
    doc.setFont("helvetica", "normal");
    const linhasObs = doc.splitTextToSize(s.observacoes, contentWidth);
    doc.text(linhasObs, margin, y + 4);
    y += linhasObs.length * 4 + 8;
  }

  if (s.imagens.length) {
    await embutirImagens(doc, s.imagens, y);
  }
}

function drawAssinaturasVistoria(doc: DocWithAutoTable, startY: number, state: VistoriaWizardState): void {
  let y = startY;
  if (y > 230) {
    doc.addPage();
    y = margin + 10;
  }
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.line(margin, y + 20, margin + 75, y + 20);
  doc.text("Vistoriador", margin, y + 25);
  doc.text(state.vistoriador || "", margin, y + 30);

  doc.line(pageWidth - margin - 75, y + 20, pageWidth - margin, y + 20);
  doc.text("Responsável Técnico", pageWidth - margin - 75, y + 25);
  doc.text(state.respTecnico || "", pageWidth - margin - 75, y + 30);
}

function nomeArquivoVistoria(state: VistoriaWizardState): string {
  const nome = (state.cliente?.razao_social || "vistoria").replace(/\s+/g, "_");
  return `Vistoria_IN23_${state.codigo || "rascunho"}_${nome}.pdf`;
}

export async function gerarPdfVistoria(state: VistoriaWizardState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawHeader(doc, "Relatório de Vistoria — Avaliação de Dispensa do PBD (Art. 6º)", "IN 23/CBMSC — SAVE", state.codigo);
  y = drawIdentificacaoVistoria(doc, y, state);
  y = drawResumoSetores(doc, y, state.setores, state.cliente?.preexistente);

  if (state.observacoesGerais) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Observações gerais", margin, y);
    doc.setFont("helvetica", "normal");
    const linhas = doc.splitTextToSize(state.observacoesGerais, contentWidth);
    doc.text(linhas, margin, y + 5);
    y += linhas.length * 4 + 10;
  }

  drawAssinaturasVistoria(doc, y, state);

  for (let i = 0; i < state.setores.length; i++) {
    await drawSetorAnexo(doc, state.setores[i], i, state);
  }

  const fileName = nomeArquivoVistoria(state);
  doc.save(fileName);
  return fileName;
}

/* ============================================================
 * LAUDO TECNICO / ORIENTACAO TECNICA
 * ============================================================ */

function formatarCorpo(doc: DocWithAutoTable, texto: string | undefined, x: number, y: number): number {
  if (!texto) return y;
  let cursorY = y;
  const blocos = texto.split(/\n\s*\n/);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  for (const bloco of blocos) {
    const linhas = bloco.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!linhas.length) continue;
    const ehLista = linhas.every((l) => l.startsWith("- "));
    if (cursorY > 265) {
      doc.addPage();
      cursorY = margin + 10;
    }
    if (ehLista) {
      for (const item of linhas) {
        const texto2 = doc.splitTextToSize(`•  ${item.slice(2)}`, contentWidth - x + margin);
        doc.text(texto2, x, cursorY);
        cursorY += texto2.length * 4.2 + 1.5;
      }
    } else {
      const texto2 = doc.splitTextToSize(linhas.join(" "), contentWidth - x + margin);
      doc.text(texto2, x, cursorY, { align: "justify", maxWidth: contentWidth - x + margin });
      cursorY += texto2.length * 4.2 + 3;
    }
  }
  return cursorY + 2;
}

function drawCapitulo1(doc: DocWithAutoTable, startY: number, state: LaudoTecnicoWizardState): number {
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COR_VERMELHO_ESCURO);
  doc.text("1. INFORMAÇÕES DO CONDOMÍNIO", margin, startY);
  doc.setTextColor(0, 0, 0);

  const cap1 = state.capitulo1;
  doc.autoTable({
    startY: startY + 3,
    theme: "grid",
    head: [],
    body: [
      [`Área construída: ${cap1.areaConstruida || ""} m²`, `Nº de pavimentos: ${cap1.pavimentos || ""}`],
      [`Altura total: ${cap1.altura || ""} m`, `Validade do atestado: ${cap1.validadeAtestado || ""}`],
    ],
    styles: { fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 200, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth / 2 }, 1: { cellWidth: contentWidth / 2 } },
  });
  let y = doc.lastAutoTable.finalY + 5;

  y = formatarCorpo(doc, cap1.textoIntro, margin, y);

  if (cap1.historico.length) {
    if (y > 260) {
      doc.addPage();
      y = margin + 10;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Histórico de alterações de projeto:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    for (const h of cap1.historico) {
      const linhas = doc.splitTextToSize(`•  ${h.tituloData}: ${h.descricao}`, contentWidth);
      doc.text(linhas, margin, y);
      y += linhas.length * 4.2 + 2;
    }
    y += 3;
  }

  if (cap1.notaObservacao) {
    if (y > 255) {
      doc.addPage();
      y = margin + 10;
    }
    doc.setDrawColor(...COR_VERMELHO_ESCURO);
    doc.setFillColor(254, 242, 242);
    const linhas = doc.splitTextToSize(cap1.notaObservacao, contentWidth - 8);
    const boxHeight = linhas.length * 4.2 + 12;
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1, 1, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COR_VERMELHO_ESCURO);
    doc.text("NOTA DE OBSERVAÇÃO", margin + 4, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(linhas, margin + 4, y + 11);
    y += boxHeight + 6;
  }

  return y;
}

function drawCapitulo2(doc: DocWithAutoTable, startY: number, state: LaudoTecnicoWizardState): number {
  let y = startY;
  if (y > 260) {
    doc.addPage();
    y = margin + 10;
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COR_VERMELHO_ESCURO);
  doc.text("2. INFRAESTRUTURA ELÉTRICA, SEGURANÇA ATIVA E QUADRO GERAL SAVE", margin, y);
  doc.setTextColor(0, 0, 0);
  y += 6;

  for (const cl of state.capitulo2.clausulas) {
    if (!cl.incluir) continue;
    if (y > 260) {
      doc.addPage();
      y = margin + 10;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(cl.titulo + ":", margin, y);
    y += 5;
    y = formatarCorpo(doc, cl.texto, margin, y);
  }

  return y;
}

function drawCapitulo3(doc: DocWithAutoTable, startY: number, state: LaudoTecnicoWizardState): number {
  let y = startY;
  if (y > 260) {
    doc.addPage();
    y = margin + 10;
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COR_VERMELHO_ESCURO);
  doc.text("3. CENÁRIOS — ENQUADRAMENTO NO ART. 6º", margin, y);
  doc.setTextColor(0, 0, 0);
  y += 6;

  y = formatarCorpo(doc, state.capitulo3.paragrafoContextual, margin, y);

  let contadorSub = 1;
  for (const cen of state.capitulo3.cenarios) {
    if (y > 255) {
      doc.addPage();
      y = margin + 10;
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(cen.titulo + (cen.fundamentacao ? ` (${cen.fundamentacao})` : ""), margin, y);
    y += 6;

    for (const sub of cen.subsecoes) {
      if (y > 258) {
        doc.addPage();
        y = margin + 10;
      }
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.text(`3.${contadorSub++} ${sub.titulo}`, margin, y);
      y += 5;
      y = formatarCorpo(doc, sub.corpo, margin, y);
    }
  }

  return y;
}

function drawCapitulo4(doc: DocWithAutoTable, startY: number, state: LaudoTecnicoWizardState): number {
  let y = startY;
  if (y > 260) {
    doc.addPage();
    y = margin + 10;
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COR_VERMELHO_ESCURO);
  doc.text("4. CONCLUSÃO E PARECER TÉCNICO", margin, y);
  doc.setTextColor(0, 0, 0);
  y += 6;
  return formatarCorpo(doc, state.capitulo4.texto, margin, y);
}

function drawAssinaturaLaudo(doc: DocWithAutoTable, startY: number, respTecnico: string): void {
  let y = startY + 15;
  if (y > 260) {
    doc.addPage();
    y = margin + 30;
  }
  doc.setDrawColor(0, 0, 0);
  doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(respTecnico || RESPONSAVEIS_TECNICOS.rt1.nome, pageWidth / 2, y + 5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Responsável Técnico", pageWidth / 2, y + 10, { align: "center" });
}

function nomeArquivoLaudo(state: LaudoTecnicoWizardState): string {
  const nome = (state.cliente?.razao_social || "laudo").replace(/\s+/g, "_");
  return `Laudo_Tecnico_IN23_${state.codigo || "rascunho"}_${nome}.pdf`;
}

export async function gerarPdfLaudo(state: LaudoTecnicoWizardState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawHeader(doc, state.tituloDocumento || "Laudo Técnico", state.subtitulo || "Orientação Técnica — IN 23/CBMSC", state.codigo);
  if (state.propriedade || state.revisao) {
    doc.setFontSize(8);
    doc.setTextColor(...COR_CINZA);
    doc.text(`${state.propriedade ? `Propriedade: ${state.propriedade}` : ""}${state.revisao ? `   |   Revisão: ${state.revisao}` : ""}`, pageWidth / 2, y - 5, { align: "center" });
    doc.setTextColor(0, 0, 0);
  }

  y = drawCapitulo1(doc, y, state);
  y = drawCapitulo2(doc, y, state);
  y = drawCapitulo3(doc, y, state);

  // Imagens das subsecoes do capitulo 3 — embutidas apos o texto, na ordem dos cenarios.
  for (const cen of state.capitulo3.cenarios) {
    for (const sub of cen.subsecoes) {
      if (!sub.imagens.length) continue;
      if (y > 260) {
        doc.addPage();
        y = margin + 10;
      }
      y = await embutirImagens(doc, sub.imagens, y + 2);
    }
  }

  y = drawCapitulo4(doc, y, state);
  drawAssinaturaLaudo(doc, y, state.respTecnico || "");

  const fileName = nomeArquivoLaudo(state);
  doc.save(fileName);
  return fileName;
}
