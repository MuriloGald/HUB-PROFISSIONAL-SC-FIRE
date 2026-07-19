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
import {
  carregarImagemComoDataUrl,
  drawCabecalhoInstitucional,
  desenharTabelaRotulos,
  type CelulaRotulo,
  COR_VERMELHO_ESCURO,
  COR_CINZA_INSTITUCIONAL,
  MARGIN_TOP,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  MARGIN_BOTTOM,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_BREAK_Y,
} from "../shared/pdf-branding";
import type { Cenario, Imagem, LaudoTecnicoWizardState, SetorVistoria, VistoriaWizardState } from "./types";
import type { ClienteSnapshot } from "@/lib/clientes/types";

applyPlugin(jsPDF);

type DocWithAutoTable = jsPDF & {
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable: { finalY: number };
};

// Margens ABNT (ver lib/shared/pdf-branding) — topo e esquerda tem valores
// diferentes agora, "margin" sozinho so serve pra x-esquerda/largura de conteudo.
const margin = MARGIN_LEFT;
const pageWidth = PAGE_WIDTH;
const contentWidth = pageWidth - MARGIN_LEFT - MARGIN_RIGHT;
const AUTOTABLE_MARGIN = { left: MARGIN_LEFT, right: MARGIN_RIGHT };

// Texto normal do documento: fonte 11, espaçamento ~1,5 entre linhas (11pt × 1,5 ≈ 5,8mm).
const FONTE_NORMAL = 11;
const ALTURA_LINHA_NORMAL = 5.8;
// Texto comum levemente acinzentado em vez de preto puro (mais suave na leitura).
const COR_TEXTO_NORMAL: [number, number, number] = [55, 65, 81];

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
async function drawHeader(doc: DocWithAutoTable, title: string, subtitle: string, codigoRef?: string): Promise<number> {
  return drawCabecalhoInstitucional(doc, title, subtitle, codigoRef);
}

/** Estampa numeração de página no canto superior direito de todas as páginas (padrão ABNT). */
function numerarPaginas(doc: DocWithAutoTable): void {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
    doc.text(String(i), PAGE_WIDTH - MARGIN_RIGHT, MARGIN_TOP - 4, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }
  doc.setPage(total);
}

/** Contador de imagens do documento inteiro — mutado por referência para a numeração ("Imagem 01", "02"...) ser contínua entre setores/subseções, não reiniciar a cada chamada. */
export interface ContadorImagem {
  n: number;
}

const IMAGEM_W = 100;
const IMAGEM_H = 65;
const IMAGEM_BLOCO_ALTURA = IMAGEM_H + 10; // imagem + legenda + espaçamento

async function embutirImagens(doc: DocWithAutoTable, imagens: Imagem[], startY: number, contador: ContadorImagem): Promise<number> {
  let y = startY;
  for (let i = 0; i < imagens.length; i++) {
    const img = imagens[i];
    const carregada = await carregarImagemComoDataUrl(img.url);
    // Verifica se o BLOCO INTEIRO da imagem cabe antes da margem inferior real —
    // nao so se "y" ja passou de um limiar generico. Uma imagem de 65mm de altura
    // comecando perto do limiar genérico (PAGE_BREAK_Y) facilmente estourava a
    // pagina, ja que aquele limiar so foi pensado pra blocos pequenos de texto.
    if (y + IMAGEM_BLOCO_ALTURA > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP + 10;
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
    doc.addImage(carregada.dataUrl, carregada.format, margin, y, IMAGEM_W, IMAGEM_H, undefined, "MEDIUM");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COR_CINZA);
    doc.text(`Imagem ${String(contador.n++).padStart(2, "0")}${img.legenda ? ` – ${img.legenda}` : ""}`, margin, y + IMAGEM_H + 4);
    doc.setTextColor(0, 0, 0);
    y += IMAGEM_BLOCO_ALTURA;
  }
  return y;
}

/* ============================================================
 * VISTORIA DE CAMPO
 * ============================================================ */

function drawIdentificacaoVistoria(doc: DocWithAutoTable, startY: number, state: VistoriaWizardState): number {
  const c = (state.cliente || {}) as ClienteSnapshot;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. IDENTIFICAÇÃO DA EDIFICAÇÃO", margin, startY);

  const linhas: CelulaRotulo[][] = [
    [{ label: "Nome da edificação", valor: c.razao_social || "" }, { label: "RE", valor: c.re || "" }],
    [
      { label: "Endereço", valor: `${c.logradouro || ""}, ${c.numero || ""}` },
      { label: "Município", valor: `${c.cidade || ""} / ${c.estado || "SC"}` },
    ],
    [
      { label: "Responsável pelo imóvel", valor: c.nome_responsavel || "" },
      { label: "Responsável Técnico", valor: state.respTecnico || "" },
    ],
    [
      { label: "Vistoriador", valor: state.vistoriador || "" },
      { label: "Edificação preexistente", valor: c.preexistente ? "Sim" : "Não" },
    ],
  ];

  const finalY = desenharTabelaRotulos(doc, startY + 3, linhas);
  return finalY + 10;
}

function drawResumoSetores(doc: DocWithAutoTable, startY: number, setores: SetorVistoria[], preexistente: boolean | undefined): number {
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("2. QUADRO-RESUMO DOS SETORES AVALIADOS", margin, startY);

  const head = [["Setor", "Vagas SAVE", "Ocupação", "Resultado"]];
  const body: RowInput[] = setores.map((s, i) => {
    const av = avaliarSetor(s, preexistente);
    return [
      `${i + 1}. ${s.nome}`,
      s.vagas || "—",
      s.ocupacao || "—",
      {
        content: av.resultado + (av.enquadramento ? ` — Inciso ${av.enquadramento}` : ""),
        styles: { textColor: corResultado(av.resultado), fontStyle: "bold" },
      },
    ];
  });

  doc.autoTable({
    margin: AUTOTABLE_MARGIN,
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

async function drawSetorAnexo(
  doc: DocWithAutoTable,
  s: SetorVistoria,
  index: number,
  state: VistoriaWizardState,
  contadorImg: ContadorImagem
): Promise<void> {
  doc.addPage();
  const c = (state.cliente || {}) as ClienteSnapshot;
  const av = avaliarSetor(s, c.preexistente);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`ANEXO ${index + 1} — DETALHAMENTO DO SETOR: ${s.nome.toUpperCase()}`, margin, MARGIN_TOP + 8);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_CINZA);
  doc.text(`Edificação: ${c.razao_social || ""}${c.re ? ` · RE: ${c.re}` : ""}`, margin, MARGIN_TOP + 13);
  doc.setTextColor(0, 0, 0);

  let y = MARGIN_TOP + 18;

  y = desenharTabelaRotulos(doc, y, [
    [{ label: "Nº de vagas com SAVE", valor: s.vagas || "" }, { label: "Ocupação", valor: s.ocupacao || "" }],
    [
      { label: "Área do ambiente", valor: `${s.areaTotal || ""} m²` },
      { label: "Área por pavimento", valor: `${s.areaPavimento || ""} m²` },
    ],
  ]);
  y += 4;

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
    margin: AUTOTABLE_MARGIN,
    startY: y,
    theme: "grid",
    head: [["Item verificado", "Resposta"]],
    body: linhas,
    headStyles: { fillColor: COR_LABEL_BG, textColor: 0, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 1.8, textColor: 0, lineColor: 200, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth * 0.72 }, 1: { cellWidth: contentWidth * 0.28, halign: "center", fontStyle: "bold" } },
  });
  y = doc.lastAutoTable.finalY + 5;

  if (y > PAGE_BREAK_Y) {
    doc.addPage();
    y = MARGIN_TOP + 10;
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
    if (y > PAGE_BREAK_Y) {
      doc.addPage();
      y = MARGIN_TOP + 10;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COR_AMBAR);
    doc.text("PLANO DE ADEQUAÇÕES — alterações possíveis para viabilizar a dispensa do PBD", margin, y);
    doc.setTextColor(0, 0, 0);
    y += 3;

    if (s.alteracoes.length) {
      doc.autoTable({
    margin: AUTOTABLE_MARGIN,
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
      doc.setFontSize(FONTE_NORMAL);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COR_TEXTO_NORMAL);
      const linhasTexto = doc.splitTextToSize(`Detalhes das adequações propostas: ${s.altObs}`, contentWidth);
      doc.text(linhasTexto, margin, y);
      doc.setTextColor(0, 0, 0);
      y += linhasTexto.length * ALTURA_LINHA_NORMAL + 4;
    }
  }

  if (s.observacoes) {
    if (y > PAGE_BREAK_Y) {
      doc.addPage();
      y = MARGIN_TOP + 10;
    }
    doc.setFontSize(FONTE_NORMAL);
    doc.setFont("helvetica", "bold");
    doc.text("Observações do setor:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COR_TEXTO_NORMAL);
    const linhasObs = doc.splitTextToSize(s.observacoes, contentWidth);
    doc.text(linhasObs, margin, y + ALTURA_LINHA_NORMAL);
    doc.setTextColor(0, 0, 0);
    y += linhasObs.length * ALTURA_LINHA_NORMAL + 8;
  }

  if (s.imagens.length) {
    await embutirImagens(doc, s.imagens, y, contadorImg);
  }
}

function drawAssinaturasVistoria(doc: DocWithAutoTable, startY: number, state: VistoriaWizardState): void {
  let y = startY;
  if (y > PAGE_BREAK_Y) {
    doc.addPage();
    y = MARGIN_TOP + 10;
  }
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.line(margin, y + 20, margin + 75, y + 20);
  doc.text("Vistoriador", margin, y + 25);
  doc.text(state.vistoriador || "", margin, y + 30);

  doc.line(pageWidth - MARGIN_RIGHT - 75, y + 20, pageWidth - MARGIN_RIGHT, y + 20);
  doc.text("Responsável Técnico", pageWidth - MARGIN_RIGHT - 75, y + 25);
  doc.text(state.respTecnico || "", pageWidth - MARGIN_RIGHT - 75, y + 30);
}

function nomeArquivoVistoria(state: VistoriaWizardState): string {
  const nome = (state.cliente?.razao_social || "vistoria").replace(/\s+/g, "_");
  return `Vistoria_IN23_${state.codigo || "rascunho"}_${nome}.pdf`;
}

export async function gerarPdfVistoria(state: VistoriaWizardState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawHeader(
    doc,
    "Relatório de Vistoria — Avaliação de Dispensa do PBD (Art. 6º)",
    "IN 23/CBMSC — SAVE",
    state.codigo ? `RG ${state.codigo}` : undefined
  );
  y = drawIdentificacaoVistoria(doc, y, state);
  y = drawResumoSetores(doc, y, state.setores, state.cliente?.preexistente);

  if (state.observacoesGerais) {
    doc.setFontSize(FONTE_NORMAL);
    doc.setFont("helvetica", "bold");
    doc.text("Observações gerais", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COR_TEXTO_NORMAL);
    const linhas = doc.splitTextToSize(state.observacoesGerais, contentWidth);
    doc.text(linhas, margin, y + ALTURA_LINHA_NORMAL);
    doc.setTextColor(0, 0, 0);
    y += linhas.length * ALTURA_LINHA_NORMAL + 8;
  }

  drawAssinaturasVistoria(doc, y, state);

  const contadorImg: ContadorImagem = { n: 1 };
  for (let i = 0; i < state.setores.length; i++) {
    await drawSetorAnexo(doc, state.setores[i], i, state, contadorImg);
  }

  numerarPaginas(doc);

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
  doc.setFontSize(FONTE_NORMAL);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COR_TEXTO_NORMAL);
  for (const bloco of blocos) {
    const linhas = bloco.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!linhas.length) continue;
    const ehLista = linhas.every((l) => l.startsWith("- "));
    if (cursorY > PAGE_BREAK_Y) {
      doc.addPage();
      cursorY = MARGIN_TOP + 10;
    }
    if (ehLista) {
      for (const item of linhas) {
        const texto2 = doc.splitTextToSize(`•  ${item.slice(2)}`, contentWidth - x + margin);
        doc.text(texto2, x, cursorY);
        cursorY += texto2.length * ALTURA_LINHA_NORMAL;
      }
    } else {
      const texto2 = doc.splitTextToSize(linhas.join(" "), contentWidth - x + margin);
      doc.text(texto2, x, cursorY, { align: "justify", maxWidth: contentWidth - x + margin });
      cursorY += texto2.length * ALTURA_LINHA_NORMAL;
    }
  }
  doc.setTextColor(0, 0, 0);
  return cursorY + 2;
}

function drawCapitulo1(doc: DocWithAutoTable, startY: number, state: LaudoTecnicoWizardState): number {
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COR_VERMELHO_ESCURO);
  doc.text("1. INFORMAÇÕES DO CONDOMÍNIO", margin, startY);
  doc.setTextColor(0, 0, 0);

  const cap1 = state.capitulo1;
  let y = desenharTabelaRotulos(doc, startY + 3, [
    [
      { label: "Área construída", valor: `${cap1.areaConstruida || ""} m²` },
      { label: "Nº de pavimentos", valor: cap1.pavimentos || "" },
    ],
    [
      { label: "Altura total", valor: `${cap1.altura || ""} m` },
      { label: "Validade do atestado", valor: cap1.validadeAtestado || "" },
    ],
  ]);
  y += 5;

  y = formatarCorpo(doc, cap1.textoIntro, margin, y);

  const historicoPreenchido = cap1.historico.filter((h) => h.tituloData.trim() || h.descricao.trim());
  if (historicoPreenchido.length) {
    if (y > PAGE_BREAK_Y) {
      doc.addPage();
      y = MARGIN_TOP + 10;
    }
    doc.setFontSize(FONTE_NORMAL);
    doc.setFont("helvetica", "bold");
    doc.text("Histórico de alterações de projeto:", margin, y);
    y += ALTURA_LINHA_NORMAL;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COR_TEXTO_NORMAL);
    for (const h of historicoPreenchido) {
      const rotulo = h.tituloData.trim() && h.descricao.trim() ? `${h.tituloData}: ${h.descricao}` : h.tituloData.trim() || h.descricao.trim();
      const linhas = doc.splitTextToSize(`•  ${rotulo}`, contentWidth);
      if (y > PAGE_BREAK_Y) {
        doc.addPage();
        y = MARGIN_TOP + 10;
      }
      doc.text(linhas, margin, y);
      y += linhas.length * ALTURA_LINHA_NORMAL;
    }
    doc.setTextColor(0, 0, 0);
    y += 3;
  }

  if (cap1.notaObservacao) {
    if (y > PAGE_BREAK_Y) {
      doc.addPage();
      y = MARGIN_TOP + 10;
    }
    doc.setFontSize(FONTE_NORMAL);
    doc.setFont("helvetica", "normal");
    const linhas = doc.splitTextToSize(cap1.notaObservacao, contentWidth - 8);
    const boxHeight = linhas.length * ALTURA_LINHA_NORMAL + 14;
    doc.setDrawColor(...COR_VERMELHO_ESCURO);
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1, 1, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COR_VERMELHO_ESCURO);
    doc.text("NOTA DE OBSERVAÇÃO", margin + 4, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(FONTE_NORMAL);
    doc.setTextColor(0, 0, 0);
    doc.text(linhas, margin + 4, y + 13);
    y += boxHeight + 6;
  }

  return y;
}

function drawCapitulo2(doc: DocWithAutoTable, startY: number, state: LaudoTecnicoWizardState): number {
  let y = startY;
  if (y > PAGE_BREAK_Y) {
    doc.addPage();
    y = MARGIN_TOP + 10;
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COR_VERMELHO_ESCURO);
  doc.text("2. INFRAESTRUTURA ELÉTRICA, SEGURANÇA ATIVA E QUADRO GERAL SAVE", margin, y);
  doc.setTextColor(0, 0, 0);
  y += 6;

  for (const cl of state.capitulo2.clausulas) {
    if (!cl.incluir) continue;
    if (y > PAGE_BREAK_Y) {
      doc.addPage();
      y = MARGIN_TOP + 10;
    }
    doc.setFontSize(FONTE_NORMAL);
    doc.setFont("helvetica", "bold");
    doc.text(cl.titulo + ":", margin, y);
    y += ALTURA_LINHA_NORMAL;
    y = formatarCorpo(doc, cl.texto, margin, y);
  }

  return y;
}

/**
 * Cada cenário vira seu próprio capítulo numerado (3, 4, 5...), não uma subseção
 * de um "Capítulo 3" fixo — segue o modelo real (Orientação Técnica Gran Reserva):
 * "3. CENÁRIO 01: ...", "4. CENÁRIO 02: ...", com subseções reiniciando em X.1
 * dentro de cada cenário. Imagens ficam embutidas logo após a subseção a que pertencem.
 */
async function drawCenario(
  doc: DocWithAutoTable,
  startY: number,
  cen: Cenario,
  capNum: number,
  contadorImg: ContadorImagem
): Promise<number> {
  let y = startY;
  if (y > PAGE_BREAK_Y) {
    doc.addPage();
    y = MARGIN_TOP + 10;
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COR_VERMELHO_ESCURO);
  doc.text(`${capNum}. ${cen.titulo}`.toUpperCase() + (cen.fundamentacao ? ` (${cen.fundamentacao})` : ""), margin, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  y = formatarCorpo(doc, cen.introducao, margin, y);

  let contadorSub = 1;
  for (const sub of cen.subsecoes ?? []) {
    if (y > PAGE_BREAK_Y) {
      doc.addPage();
      y = MARGIN_TOP + 10;
    }
    doc.setFontSize(FONTE_NORMAL);
    doc.setFont("helvetica", "bold");
    doc.text(`${capNum}.${contadorSub++} ${sub.titulo}`, margin, y);
    y += ALTURA_LINHA_NORMAL;
    y = formatarCorpo(doc, sub.corpo, margin, y);

    if (sub.imagens?.length) {
      if (y > PAGE_BREAK_Y) {
        doc.addPage();
        y = MARGIN_TOP + 10;
      }
      y = await embutirImagens(doc, sub.imagens, y + 2, contadorImg);
    }
  }

  return y;
}

function drawConclusao(doc: DocWithAutoTable, startY: number, state: LaudoTecnicoWizardState, capNum: number): number {
  let y = startY;
  if (y > PAGE_BREAK_Y) {
    doc.addPage();
    y = MARGIN_TOP + 10;
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COR_VERMELHO_ESCURO);
  doc.text(`${capNum}. CONCLUSÃO E PARECER TÉCNICO`, margin, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  return formatarCorpo(doc, state.capitulo4.texto, margin, y);
}

function drawAssinaturaLaudo(doc: DocWithAutoTable, startY: number, respTecnico: string): void {
  let y = startY + 15;
  if (y > PAGE_BREAK_Y) {
    doc.addPage();
    y = MARGIN_TOP + 30;
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

export async function gerarPdfLaudo(estadoRecebido: LaudoTecnicoWizardState): Promise<string> {
  // Laudos salvos antes de algum ajuste de schema podem não ter todos os capítulos
  // preenchidos; sem isso o acesso direto a state.capituloN.campo lança e quebra o download.
  const state: LaudoTecnicoWizardState = {
    ...estadoRecebido,
    capitulo1: { ...estadoRecebido.capitulo1, historico: estadoRecebido.capitulo1?.historico ?? [] },
    capitulo2: { ...estadoRecebido.capitulo2, clausulas: estadoRecebido.capitulo2?.clausulas ?? [] },
    capitulo3: { ...estadoRecebido.capitulo3, cenarios: estadoRecebido.capitulo3?.cenarios ?? [] },
    capitulo4: estadoRecebido.capitulo4 ?? {},
  };

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

  // Cada cenário é seu próprio capítulo (3, 4, 5...); a Conclusão pega o próximo número livre.
  const contadorImg: ContadorImagem = { n: 1 };
  let capNum = 2;
  for (const cen of state.capitulo3.cenarios) {
    capNum += 1;
    y = await drawCenario(doc, y, cen, capNum, contadorImg);
  }

  y = drawConclusao(doc, y, state, capNum + 1);
  drawAssinaturaLaudo(doc, y, state.respTecnico || "");
  numerarPaginas(doc);

  const fileName = nomeArquivoLaudo(state);
  doc.save(fileName);
  return fileName;
}
