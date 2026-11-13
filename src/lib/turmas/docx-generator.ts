"use client";

/**
 * Gerador .docx do Relatório da Turma — mesmo conteúdo do PDF
 * (src/lib/turmas/pdf-generator.ts), mas em formato editável. É a base da
 * exportação para Google Docs: o Drive converte .docx em Google Doc nativo no
 * upload (ver src/lib/shared/google-docs.ts).
 *
 * Os "gráficos" de barra viram uma sequência de blocos (█) coloridos — é o que
 * sobrevive intacto tanto no Word quanto na conversão pro Google Docs, sem
 * depender de imagem renderizada ou de gráfico nativo.
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  type ParagraphChild,
} from "docx";
import { formatarDataBR } from "../shared/date-format";
import { MARGIN_TOP, MARGIN_LEFT, MARGIN_RIGHT, MARGIN_BOTTOM, MARGIN_LEFT_CABECALHO } from "../shared/pdf-branding";
import type { RelatorioTurmaData } from "./relatorio-types";

const FONTE = "Arial";
const VERMELHO = "A81D07";
const CINZA = "64748B";
const TRILHO = "D9D9D9";
const ROTULO_BG = "E6E6E6";

/** 1mm = 56,7 twips (DXA). */
const mm = (v: number) => Math.round(v * 56.7);
const PAGE_W = mm(210);
const CONTENT_W = PAGE_W - mm(MARGIN_LEFT) - mm(MARGIN_RIGHT);
const BLOCOS_BARRA = 24;

const SEM_BORDA = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const SEM_BORDAS = { top: SEM_BORDA, bottom: SEM_BORDA, left: SEM_BORDA, right: SEM_BORDA, insideHorizontal: SEM_BORDA, insideVertical: SEM_BORDA };
const BORDA_FINA = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const BORDAS_GRID = { top: BORDA_FINA, bottom: BORDA_FINA, left: BORDA_FINA, right: BORDA_FINA, insideHorizontal: BORDA_FINA, insideVertical: BORDA_FINA };

function txt(text: string, opts: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}): TextRun {
  return new TextRun({ text, font: FONTE, size: Math.round((opts.size ?? 9) * 2), bold: opts.bold, italics: opts.italics, color: opts.color ?? "000000" });
}

function par(children: ParagraphChild[], opts: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; after?: number; before?: number; keepNext?: boolean } = {}): Paragraph {
  return new Paragraph({ children, alignment: opts.align, spacing: { after: opts.after ?? 0, before: opts.before ?? 0 }, keepNext: opts.keepNext });
}

function celula(children: Paragraph[], opts: { width: number; shading?: string; columnSpan?: number; borders?: typeof SEM_BORDAS } = { width: 0 }): TableCell {
  return new TableCell({
    children,
    width: { size: opts.width, type: WidthType.DXA },
    columnSpan: opts.columnSpan,
    verticalAlign: VerticalAlign.CENTER,
    shading: opts.shading ? { type: ShadingType.CLEAR, fill: opts.shading, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    borders: opts.borders,
  });
}

async function carregarLogo(): Promise<{ data: ArrayBuffer; width: number; height: number } | null> {
  try {
    const res = await fetch("/logo-sc-fire.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return { data: await blob.arrayBuffer(), ...dims };
  } catch {
    return null;
  }
}

/** Cabeçalho institucional: logo + dados da empresa | endereço/contato, com a borda vermelha embaixo — espelho do drawCabecalhoInstitucional. */
async function cabecalho(titulo: string, subtitulo: string): Promise<(Paragraph | Table)[]> {
  const logo = await carregarLogo();
  // A margem do cabeçalho no PDF é mais estreita (20mm) que a do corpo (30mm): recuo negativo compensa.
  const recuo = mm(MARGIN_LEFT_CABECALHO - MARGIN_LEFT);
  const larguraTotal = CONTENT_W - recuo;

  const alturaLogoPx = 71; // ~18,7mm a 96dpi
  const colLogo = logo ? Math.round(larguraTotal * 0.26) : 0;
  const colResto = Math.round((larguraTotal - colLogo) / 2);

  const celulas: TableCell[] = [];
  if (logo) {
    celulas.push(
      celula(
        [
          par([
            new ImageRun({
              type: "png",
              data: logo.data,
              transformation: { width: Math.round((logo.width / logo.height) * alturaLogoPx), height: alturaLogoPx },
            }),
          ]),
        ],
        { width: colLogo, borders: SEM_BORDAS }
      )
    );
  }
  celulas.push(
    celula(
      [par([txt("EZS Consultoria e Treinamentos LTDA", { bold: true, size: 9 })]), par([txt("CNPJ 20.544.712/0001-89", { size: 7.5, color: CINZA })])],
      { width: colResto, borders: SEM_BORDAS }
    ),
    celula(
      [
        par([txt("R. Hermes Zapelini, 513 - sala 02", { size: 7.5, color: CINZA })], { align: AlignmentType.RIGHT }),
        par([txt("Barreiros, São José - SC, 88.110-050", { size: 7.5, color: CINZA })], { align: AlignmentType.RIGHT }),
        par([txt("(48) 99141-2186  |  (48) 3093 6140", { size: 7.5, bold: true })], { align: AlignmentType.RIGHT }),
        par([txt("contato@scfire.com.br", { size: 7.5, color: CINZA })], { align: AlignmentType.RIGHT }),
      ],
      { width: colResto, borders: SEM_BORDAS }
    )
  );

  return [
    new Table({
      rows: [new TableRow({ children: celulas, cantSplit: true })],
      width: { size: larguraTotal, type: WidthType.DXA },
      columnWidths: logo ? [colLogo, colResto, colResto] : [colResto, colResto],
      indent: { size: recuo, type: WidthType.DXA },
      borders: SEM_BORDAS,
    }),
    new Paragraph({
      children: [],
      indent: { left: recuo },
      border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: VERMELHO, space: 1 } },
      spacing: { after: 240 },
    }),
    par([txt(titulo, { bold: true, size: 12 })], { align: AlignmentType.CENTER, after: 60 }),
    par([txt(subtitulo, { size: 9, color: CINZA })], { align: AlignmentType.CENTER, after: 240 }),
  ];
}

function tituloSecao(texto: string): Paragraph {
  return par([txt(texto, { bold: true, size: 10 })], { before: 120, after: 120, keepNext: true });
}

function notaSuave(texto: string, italico = false): Paragraph {
  return par([txt(texto, { size: 8.5, color: CINZA, italics: italico })], { after: 120 });
}

/** Linha de "gráfico": rótulo | barra em blocos | valor. */
function linhaBarra(rotulo: string, valor: number, max: number, sufixo: string): TableRow {
  const proporcao = max > 0 ? Math.max(0, Math.min(1, valor / max)) : 0;
  const cheios = Math.round(proporcao * BLOCOS_BARRA);
  const colRotulo = Math.round(CONTENT_W * 0.4);
  const colValor = Math.round(CONTENT_W * 0.12);
  const colBarra = CONTENT_W - colRotulo - colValor;
  return new TableRow({
    cantSplit: true,
    children: [
      celula([par([txt(rotulo, { size: 8.5 })])], { width: colRotulo, borders: SEM_BORDAS }),
      celula(
        [par([txt("█".repeat(cheios), { size: 9, color: VERMELHO }), txt("█".repeat(BLOCOS_BARRA - cheios), { size: 9, color: TRILHO })])],
        { width: colBarra, borders: SEM_BORDAS }
      ),
      celula([par([txt(sufixo, { size: 8.5, bold: true })], { align: AlignmentType.RIGHT })], { width: colValor, borders: SEM_BORDAS }),
    ],
  });
}

function tabelaBarras(linhas: TableRow[]): Table {
  const colRotulo = Math.round(CONTENT_W * 0.4);
  const colValor = Math.round(CONTENT_W * 0.12);
  return new Table({
    rows: linhas,
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [colRotulo, CONTENT_W - colRotulo - colValor, colValor],
    borders: SEM_BORDAS,
  });
}

function identificacao(data: RelatorioTurmaData): (Paragraph | Table)[] {
  const { identificacao: id, avaliacao } = data;
  const colRotulo = Math.round(CONTENT_W * 0.2);
  const colValor = Math.round(CONTENT_W / 2) - colRotulo;
  const colValor2 = CONTENT_W - 2 * colRotulo - colValor;

  const rotulo = (t: string) => celula([par([txt(t, { bold: true, size: 8.5 })])], { width: colRotulo, shading: ROTULO_BG });
  const valor = (t: string, width: number, columnSpan?: number) => celula([par([txt(t, { size: 8.5 })])], { width, columnSpan });

  const linha = (cells: TableCell[]) => new TableRow({ children: cells, cantSplit: true });
  const larguraCheia = CONTENT_W - colRotulo;

  return [
    tituloSecao("1. IDENTIFICAÇÃO"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [colRotulo, colValor, colRotulo, colValor2],
      borders: BORDAS_GRID,
      rows: [
        linha([rotulo("Curso"), valor(id.trainingName || "", larguraCheia, 3)]),
        linha([
          rotulo("Carga Horária"),
          valor(id.totalHours != null ? `${id.totalHours}h` : "", colValor),
          rotulo("Data"),
          valor(formatarDataBR(id.scheduledAt || id.finishedAt) || "", colValor2),
        ]),
        linha([rotulo("Cliente"), valor(id.clienteNome || "—", colValor), rotulo("Instrutor"), valor(id.instrutorNome || "—", colValor2)]),
        linha([rotulo("Total de Alunos Presentes"), valor(String(avaliacao.totalPresentes), larguraCheia, 3)]),
      ],
    }),
    par([], { after: 200 }),
  ];
}

function avaliacao(data: RelatorioTurmaData): (Paragraph | Table)[] {
  const { avaliacao: av } = data;
  const out: (Paragraph | Table)[] = [
    tituloSecao("2. AVALIAÇÃO DE APRENDIZAGEM (EM 2 PROVAS)"),
    notaSuave(`Resultado das provas aplicadas aos ${av.totalPresentes} aluno(s) presente(s).`),
  ];

  if (av.incendio.totalRespostas + av.socorros.totalRespostas === 0) {
    out.push(notaSuave("Nenhuma avaliação respondida até o momento.", true));
    return out;
  }

  const linhas: TableRow[] = [];
  if (av.incendio.totalRespostas > 0) {
    linhas.push(linhaBarra("Prova 1: Combate a Incêndio", av.incendio.mediaAcertosPercent, 100, `${av.incendio.mediaAcertosPercent.toFixed(0)}%`));
  }
  if (av.socorros.totalRespostas > 0) {
    linhas.push(linhaBarra("Prova 2: Primeiros Socorros", av.socorros.mediaAcertosPercent, 100, `${av.socorros.mediaAcertosPercent.toFixed(0)}%`));
  }
  if (av.incendio.totalRespostas > 0 && av.socorros.totalRespostas > 0) {
    linhas.push(linhaBarra("Média Geral de Aprendizagem", av.mediaGeralPercent, 100, `${av.mediaGeralPercent.toFixed(0)}%`));
  }
  out.push(tabelaBarras(linhas), par([], { after: 200 }));
  return out;
}

function satisfacao(data: RelatorioTurmaData): (Paragraph | Table)[] {
  const { satisfacao: s } = data;
  const out: (Paragraph | Table)[] = [
    tituloSecao("3. PESQUISA DE SATISFAÇÃO"),
    notaSuave(`${s.totalRespostas} de ${s.totalPresentes} aluno(s) presente(s) responderam a pesquisa.`),
  ];

  if (s.totalRespostas === 0) {
    out.push(notaSuave("Nenhuma pesquisa de satisfação respondida até o momento.", true));
    return out;
  }

  out.push(
    par([txt(`Satisfação Geral: ${s.mediaGeral.toFixed(1)} / 5`, { bold: true, size: 9 })], { after: 120, keepNext: true }),
    tabelaBarras(s.perguntas.map((p) => linhaBarra(p.pergunta, p.media, 5, `${p.media.toFixed(1)}/5`))),
    par([], { after: 160 })
  );

  // Distribuição das notas (quantas notas 1..5 cada pergunta recebeu).
  const colPergunta = Math.round(CONTENT_W * 0.6);
  const colNota = Math.round((CONTENT_W - colPergunta) / 5);
  const cab = (t: string, w: number) => celula([par([txt(t, { bold: true, size: 8 })], { align: AlignmentType.CENTER })], { width: w, shading: "DCDCDC" });
  const num = (t: string) => celula([par([txt(t, { size: 8 })], { align: AlignmentType.CENTER })], { width: colNota });

  out.push(
    new Table({
      width: { size: colPergunta + colNota * 5, type: WidthType.DXA },
      columnWidths: [colPergunta, colNota, colNota, colNota, colNota, colNota],
      borders: BORDAS_GRID,
      rows: [
        new TableRow({
          tableHeader: true,
          cantSplit: true,
          children: [cab("Pergunta", colPergunta), ...[1, 2, 3, 4, 5].map((n) => cab(`Nota ${n}`, colNota))],
        }),
        ...s.perguntas.map(
          (p) =>
            new TableRow({
              cantSplit: true,
              children: [celula([par([txt(p.pergunta, { size: 8 })])], { width: colPergunta }), ...p.distribuicao.map((q) => num(String(q)))],
            })
        ),
      ],
    }),
    par([], { after: 200 })
  );
  return out;
}

function comentarios(data: RelatorioTurmaData): Paragraph[] {
  const lista = data.satisfacao.comentarios;
  const out = [tituloSecao("4. COMENTÁRIOS DOS ALUNOS")];
  if (lista.length === 0) {
    out.push(notaSuave("Nenhum comentário registrado.", true));
    return out;
  }
  for (const c of lista) out.push(par([txt(`•  ${c}`, { size: 8.5 })], { after: 80 }));
  return out;
}

function observacoes(data: RelatorioTurmaData): Paragraph[] {
  if (!data.observacoes) return [];
  return [
    tituloSecao("5. OBSERVAÇÕES DO INSTRUTOR"),
    ...data.observacoes.split(/\r?\n/).map((linha) => par([txt(linha, { size: 8.5 })], { after: 60 })),
  ];
}

export function nomeArquivoRelatorioTurma(data: RelatorioTurmaData, extensao: string): string {
  const nome = (data.identificacao.trainingName || "curso").replace(/\s+/g, "_");
  const data_ = (data.identificacao.scheduledAt || data.identificacao.finishedAt || "").slice(0, 10) || "sem_data";
  return `Relatorio_Turma_${nome}_${data_}${extensao}`;
}

/** Monta o .docx do Relatório da Turma e devolve o Blob (não dispara download). */
export async function gerarDocxRelatorioTurma(data: RelatorioTurmaData): Promise<Blob> {
  const doc = new Document({
    creator: "SC Fire — Hub Profissional",
    title: `Relatório da Turma — ${data.identificacao.trainingName || ""}`,
    styles: { default: { document: { run: { font: FONTE, size: 18 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: mm(297) },
            margin: { top: mm(MARGIN_TOP), bottom: mm(MARGIN_BOTTOM), left: mm(MARGIN_LEFT), right: mm(MARGIN_RIGHT) },
          },
        },
        children: [
          ...(await cabecalho("Relatório da Turma — Curso Aplicado", data.identificacao.trainingName || "")),
          ...identificacao(data),
          ...avaliacao(data),
          ...satisfacao(data),
          ...comentarios(data),
          ...observacoes(data),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
}

/** Gera o .docx e dispara o download no navegador. Retorna o nome do arquivo. */
export async function baixarDocxRelatorioTurma(data: RelatorioTurmaData): Promise<string> {
  const blob = await gerarDocxRelatorioTurma(data);
  const fileName = nomeArquivoRelatorioTurma(data, ".docx");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return fileName;
}
