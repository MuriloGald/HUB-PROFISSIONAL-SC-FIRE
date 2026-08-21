"use client";

/**
 * Gerador de PDF do modulo Habite-se — Termo de Entrega do Imovel, usando
 * jsPDF + jsPDF-AutoTable (mesmo motor dos demais geradores do hub).
 * Porta o modelo de documento do CBMSC/SC fornecido pelo usuario (Google Docs).
 *
 * Documento unico, sem variacao de "porte" como no modulo de Eventos — sempre
 * as mesmas 6 secoes. Geracao e assincrona por causa do cabecalho institucional
 * (carrega o logo) e das fotos dos sistemas instalados (Supabase Storage).
 */

import { jsPDF } from "jspdf";
import { applyPlugin, type RowInput } from "jspdf-autotable";
import { RESPONSAVEIS_TECNICOS, EMPRESA, SISTEMAS_CONFORMIDADE } from "./constants";
import {
  carregarImagemComoDataUrl,
  drawCabecalhoOficialCBMSC,
  desenharTabelaRotulos,
  formatarRegistroProfissional,
  encaixarImagemNaCaixa,
  COR_CINZA_INSTITUCIONAL,
  MARGIN_TOP,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  PAGE_WIDTH,
  PAGE_BREAK_Y,
} from "../shared/pdf-branding";
import type { HabiteseWizardState, ResponsavelTecnicoCustom, SistemaConformidade } from "./types";

applyPlugin(jsPDF);

type DocWithAutoTable = jsPDF & {
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable: { finalY: number };
};

const margin = MARGIN_LEFT;
const pageWidth = PAGE_WIDTH;
const contentWidth = pageWidth - MARGIN_LEFT - MARGIN_RIGHT;

/** RT agora e um Profissional cadastrado; o formato antigo (chave fixa rt1/rt2 ou "outro" digitado a mao) so aparece em termos salvos antes dessa mudanca. */
function resolverRt(state: HabiteseWizardState): ResponsavelTecnicoCustom {
  const rt = state.rt;
  if (rt && "chave" in rt) {
    if (rt.chave === "outro" && rt.custom) return rt.custom;
    const fixo = RESPONSAVEIS_TECNICOS[rt.chave ?? "rt1"];
    return { nome: fixo.nome, cpf: fixo.cpf, telefone: fixo.telefone, email: fixo.email, registro: fixo.nr_rt };
  }
  if (rt) {
    return {
      nome: rt.nome,
      cpf: rt.cpf ?? "",
      telefone: rt.telefone ?? "",
      email: rt.email ?? "",
      registro: formatarRegistroProfissional({ nome: rt.nome, registroTipo: rt.registro_tipo, registroNumero: rt.registro_numero }),
    };
  }
  return { nome: "", cpf: "", telefone: "", email: "", registro: "" };
}

/** Quebra a página se o bloco a partir de `y` (com a altura `blockHeight` informada) não couber até a margem inferior. */
function quebrarSeNecessario(doc: DocWithAutoTable, y: number, blockHeight = 0): number {
  if (y + blockHeight > PAGE_BREAK_Y) {
    doc.addPage();
    return MARGIN_TOP + 10;
  }
  return y;
}

function drawSecaoTitulo(doc: DocWithAutoTable, y: number, texto: string): number {
  const startY = quebrarSeNecessario(doc, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(texto, margin, startY);
  return startY;
}

function drawResponsavelImovel(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "1. RESPONSÁVEL PELO IMÓVEL");
  const c = state.cliente || ({} as NonNullable<HabiteseWizardState["cliente"]>);

  const finalY = desenharTabelaRotulos(doc, startY + 3, [
    [
      { label: "Nome", valor: c.razao_social || "" },
      { label: "Telefone(s)", valor: `${c.telefone || ""}${c.ramal ? ` ramal ${c.ramal}` : ""}` },
    ],
    [
      { label: "CPF/CNPJ", valor: c.cnpj || c.cpf || "" },
      { label: "E-mail", valor: c.email || "" },
    ],
    [{ label: "Logradouro", valor: `${c.logradouro || ""}  Nº: ${c.numero || ""}  Complemento: ${c.complemento || ""}  Bairro: ${c.bairro || ""}` }],
    [{ label: "Cidade", valor: `${c.cidade || ""} – ${c.estado || "Santa Catarina"}   CEP: ${c.cep || ""}` }],
  ]);

  return finalY + 5;
}

function drawResponsavelTecnico(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "2. RESPONSÁVEL TÉCNICO PELA EXECUÇÃO DA OBRA");
  const rt = resolverRt(state);

  const finalY = desenharTabelaRotulos(doc, startY + 3, [
    [
      { label: "Nome", valor: rt.nome },
      { label: "Telefone(s)", valor: rt.telefone },
    ],
    [
      { label: "CPF", valor: rt.cpf },
      { label: "E-mail", valor: rt.email },
    ],
    [{ label: "Nº de registro no conselho de classe", valor: rt.registro }],
  ]);

  return finalY + 5;
}

function drawDescricaoImovel(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "3. DESCRIÇÃO DO IMÓVEL");
  const c = state.cliente || ({} as NonNullable<HabiteseWizardState["cliente"]>);

  const finalY = desenharTabelaRotulos(doc, startY + 3, [
    [
      { label: "RE", valor: state.imovel_re || "" },
      { label: "CNPJ/CPF", valor: state.imovel_cnpj_cpf || c.cnpj || c.cpf || "" },
    ],
    [{ label: "Logradouro", valor: `${state.imovel_logradouro || ""}  Nº: ${state.imovel_numero || ""}  Complemento: ${state.imovel_complemento || ""}  Bairro: ${state.imovel_bairro || ""}` }],
    [{ label: "Cidade", valor: `${state.imovel_cidade || ""}   CEP: ${state.imovel_cep || ""}` }],
    [{ label: "Detalhes (se houver)", valor: state.imovel_detalhes || "" }],
    [
      { label: "Extintores (quantidade total)", valor: state.extintores_qtd || "0" },
      { label: "Iluminação de emergência", valor: state.iluminacao_qtd || "0" },
    ],
    [
      { label: "Placa fotoluminescente", valor: state.placa_qtd || "0" },
      { label: "Placa luminosa", valor: state.placa_luminosa_qtd || "0" },
    ],
  ]);

  return finalY + 5;
}

function drawDadosSolicitacao(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  const startY = drawSecaoTitulo(doc, y, "4. DADOS DA SOLICITAÇÃO");

  const riscoTexto = (["II", "III", "IV", "V"] as const).map((r) => (state.risco === r ? `(X) ${r}` : `( ) ${r}`)).join("  ");

  const finalY = desenharTabelaRotulos(doc, startY + 3, [
    [
      { label: "Área total da solicitação (m²)", valor: state.area_total || "" },
      { label: "Protocolo", valor: state.protocolo || "" },
    ],
    [
      { label: "Área da alteração/ampliação/reforma", valor: state.area_alteracao || "" },
      { label: "Ocupação(ões)", valor: state.ocupacao || "" },
    ],
    [
      { label: "Risco", valor: riscoTexto },
      { label: "Nº de pavimentos/blocos", valor: state.pavimentos_blocos || "" },
    ],
    [{ label: "Observações", valor: state.observacoes || "" }],
  ]);

  return finalY + 5;
}

/**
 * Só o título + texto de instrução da seção 5 — sem as fotos, sem quebra de
 * página forçada. As fotos em si (`drawFotosAnexadas`) vêm depois da seção 6,
 * como anexo, pra manter o formulário (seções 1–6) inteiro na primeira página,
 * igual ao modelo original do CBMSC (Anexo J da IN 01).
 */
function drawDescritivoSistemasIntro(doc: DocWithAutoTable, y: number, alturaReservada: number): number {
  const startY = quebrarSeNecessario(doc, y, alturaReservada);
  let cursorY = drawSecaoTitulo(doc, startY, "5. DESCRITIVO DOS SISTEMAS E MEDIDAS DE SEGURANÇA CONTRA INCÊNDIO INSTALADOS");
  cursorY += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const texto =
    "Apresentar o descritivo quali-quantitativo dos sistemas e medidas de segurança contra incêndio executados no imóvel, anexando no mínimo uma foto ilustrativa de cada sistema previsto.";
  const linhas = doc.splitTextToSize(texto, contentWidth);
  doc.text(linhas, margin, cursorY);
  cursorY += linhas.length * 5;

  return cursorY + 6;
}

function alturaDescritivoSistemasIntro(doc: DocWithAutoTable): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const texto =
    "Apresentar o descritivo quali-quantitativo dos sistemas e medidas de segurança contra incêndio executados no imóvel, anexando no mínimo uma foto ilustrativa de cada sistema previsto.";
  const linhas = doc.splitTextToSize(texto, contentWidth);
  return 6 /* titulo */ + 5 + linhas.length * 5 + 6;
}

/**
 * Fotos dos sistemas instalados, sempre a partir de uma página nova — anexo do
 * formulário, não parte dele. Duas colunas por linha (em vez de uma foto por
 * linha) pra caber mais fotos por página e ficar mais compacto; as imagens são
 * reamostradas pro tamanho de exibição e reexportadas em JPEG (em vez do PNG
 * sem perdas de antes), senão fotos de celular em resolução original inflam o
 * PDF final facilmente acima de 10MB.
 */
async function drawFotosAnexadas(doc: DocWithAutoTable, imagens: { url: string; legenda?: string }[]): Promise<void> {
  if (imagens.length === 0) return;

  doc.addPage();
  let cursorY = drawSecaoTitulo(doc, MARGIN_TOP + 10, "FOTOS DOS SISTEMAS INSTALADOS (ANEXO AO TERMO DE ENTREGA)");
  cursorY += 8;

  const gap = 8;
  const w = (contentWidth - gap) / 2;
  const h = (w * 65) / 100;
  const opcoesCompressao = { maxDim: 1200, jpegQuality: 0.82 };

  for (let i = 0; i < imagens.length; i += 2) {
    // Reserva o bloco inteiro (imagem + legenda) antes de decidir se quebra a
    // pagina — checar so o Y atual (sem a altura da imagem) deixava a foto
    // "vazar" pra baixo da margem quando ela nao cabia inteira na pagina.
    cursorY = quebrarSeNecessario(doc, cursorY, h + 14);
    const par = [imagens[i], imagens[i + 1]].filter((img): img is { url: string; legenda?: string } => Boolean(img));

    for (let col = 0; col < par.length; col++) {
      const img = par[col];
      const x = margin + col * (w + gap);
      const n = i + col + 1;
      const carregada = await carregarImagemComoDataUrl(img.url, opcoesCompressao);
      if (!carregada) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text(`[Imagem indisponível: ${img.legenda || img.url}]`, x, cursorY + h / 2, { maxWidth: w });
        continue;
      }
      const encaixe = encaixarImagemNaCaixa(doc, carregada.dataUrl, w, h);
      doc.addImage(carregada.dataUrl, carregada.format, x + encaixe.offsetX, cursorY + encaixe.offsetY, encaixe.w, encaixe.h, undefined, "MEDIUM");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
      doc.text(`Imagem ${String(n).padStart(2, "0")}${img.legenda ? ` – ${img.legenda}` : ""}`, x, cursorY + h + 4, { maxWidth: w });
      doc.setTextColor(0, 0, 0);
    }
    cursorY += h + 10;
  }
}

function drawDeclaracao(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): void {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const textoRecebimento =
    "Declaro que recebi o imóvel conforme o descritivo apresentado, em conformidade com as NSCI, estando ciente de que após o recebimento é minha responsabilidade manter as características do imóvel inalteradas, bem como a operacionalidade e manutenção dos SMSCI previstos.";
  const textoEntrega = "Declaro que realizei a entrega do imóvel em conformidade com o descritivo apresentado.";
  const linhasRecebimento = doc.splitTextToSize(textoRecebimento, contentWidth);
  const linhasEntrega = doc.splitTextToSize(textoEntrega, contentWidth);

  // Altura do capitulo inteiro (titulo + 2 textos + 2 blocos de assinatura) calculada
  // antes de desenhar, pra decidir a quebra de pagina uma unica vez no topo — assim o
  // capitulo 6 sempre vai inteiro pra pagina seguinte quando nao cabe todo na atual,
  // em vez de quebrar no meio e deixar uma assinatura sozinha.
  const alturaTitulo = 6;
  const alturaLocalData = 6;
  const alturaTexto1 = linhasRecebimento.length * 5 + 16;
  const alturaAssinatura1 = 18;
  const alturaTexto2 = linhasEntrega.length * 5 + 16;
  const alturaAssinatura2 = 10;
  const alturaTotal = alturaTitulo + alturaLocalData + alturaTexto1 + alturaAssinatura1 + alturaTexto2 + alturaAssinatura2;

  let cursorY = quebrarSeNecessario(doc, y, alturaTotal);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("6. DECLARAÇÃO DE ENTREGA E RECEBIMENTO", margin, cursorY);
  cursorY += alturaTitulo;

  // Cidade do imóvel entregue, não a sede da SC Fire — é ali que a entrega e as
  // assinaturas acontecem. `data_emissao` é gravado como timestamp real (não uma
  // data "yyyy-mm-dd" pura), então usar Date diretamente aqui não sofre do bug de
  // fuso horário que `formatarDataBR` existe pra evitar em datas soltas.
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const cidadeAssinatura = state.imovel_cidade || state.cliente?.cidade || EMPRESA.cidade;
  const dataAssinatura = new Date(state.data_emissao || Date.now()).toLocaleDateString("pt-BR");
  doc.text(`${cidadeAssinatura}, ${dataAssinatura}`, margin, cursorY);
  cursorY += alturaLocalData;

  doc.text(linhasRecebimento, margin, cursorY);
  cursorY += alturaTexto1;

  doc.line(margin, cursorY, margin + 80, cursorY);
  doc.text("Assinatura do responsável pelo imóvel", margin, cursorY + 5);
  doc.text(state.cliente?.razao_social || "", margin, cursorY + 10);
  cursorY += alturaAssinatura1;

  doc.text(linhasEntrega, margin, cursorY);
  cursorY += alturaTexto2;

  const rt = resolverRt(state);
  doc.line(margin, cursorY, margin + 80, cursorY);
  doc.text("Assinatura do responsável técnico", margin, cursorY + 5);
  doc.text(rt.nome, margin, cursorY + 10);
}

function nomeArquivo(state: HabiteseWizardState): string {
  const nome = (state.cliente?.razao_social || "imovel").replace(/\s+/g, "_");
  return `Termo_Entrega_Imovel_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/**
 * Gera o PDF do Termo de Entrega do Imóvel (Anexo J da IN 01/CBMSC) e dispara o
 * download no navegador. Segue o modelo oficial à risca — cabeçalho do CBMSC,
 * sem identidade visual SC Fire, sem subtítulo (o modelo não tem um). Seções
 * 1–6 ficam juntas (o formulário cabe numa página no modelo); as fotos exigidas
 * pela seção 5 vêm depois, como anexo. Retorna o nome do arquivo gerado.
 */
export async function gerarPdf(state: HabiteseWizardState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoOficialCBMSC(doc, "Termo de entrega do imóvel");
  y = drawResponsavelImovel(doc, y, state);
  y = drawResponsavelTecnico(doc, y, state);
  y = drawDescricaoImovel(doc, y, state);
  y = drawDadosSolicitacao(doc, y, state);
  y = drawDescritivoSistemasIntro(doc, y, alturaDescritivoSistemasIntro(doc));
  drawDeclaracao(doc, y, state);
  await drawFotosAnexadas(doc, state.imagens || []);

  const fileName = nomeArquivo(state);
  doc.save(fileName);
  return fileName;
}

/* ============================================================
 * ANEXO H — Relatorio de Conformidade referente a atestado para Habite-se
 * ============================================================ */

function drawResponsavelTecnicoAnexoI(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  // Reserva a altura aproximada de título + tabela (4 linhas curtas) antes de decidir
  // a quebra de página — título e tabela sempre ficam juntos, nunca um título órfão
  // no fim de uma página com a tabela começando na seguinte.
  const startY = drawSecaoTitulo(doc, quebrarSeNecessario(doc, y, 48), "1. RESPONSÁVEL TÉCNICO PELA EXECUÇÃO DA OBRA");
  const rt = resolverRt(state);

  const body: RowInput[] = [
    [`Nome: ${rt.nome}`, `Telefone(s): ${rt.telefone}`],
    [`CPF/CNPJ: ${rt.cpf}`, `E-mail: ${rt.email}`],
    [{ content: `Logradouro: ${EMPRESA.endereco}  Nº: ${EMPRESA.numero}  Complemento: ${EMPRESA.complemento}  Bairro: ${EMPRESA.bairro}`, colSpan: 2 }],
    [{ content: `Cidade: ${EMPRESA.cidade}   CEP: ${EMPRESA.cep}`, colSpan: 2 }],
  ];

  doc.autoTable({
    startY: startY + 3,
    theme: "grid",
    head: [],
    body,
    styles: { fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth / 2 }, 1: { cellWidth: contentWidth / 2 } },
    margin: { left: margin, right: MARGIN_RIGHT },
    // Nunca parte a tabela no meio entre duas páginas — se não couber inteira aqui,
    // desce inteira pra próxima em vez de deixar metade das linhas em cada página.
    pageBreak: "avoid",
  });

  return doc.lastAutoTable.finalY + 8;
}

function drawDescricaoImovelAnexoI(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  // Reserva um pouco mais de altura que a seção 1 — a linha de "Detalhes" pode
  // quebrar em 2+ linhas dependendo do texto, então a tabela fica mais alta.
  const startY = drawSecaoTitulo(doc, quebrarSeNecessario(doc, y, 65), "2. DESCRIÇÃO DO IMÓVEL");
  const c = state.cliente || ({} as NonNullable<HabiteseWizardState["cliente"]>);

  const body: RowInput[] = [
    [`RE: ${state.imovel_re || ""}`, `CNPJ/CPF: ${state.imovel_cnpj_cpf || c.cnpj || c.cpf || ""}`],
    [`Protocolo PPCI: ${state.protocolo || ""}`, `Ocupação: ${state.ocupacao || ""}`],
    [
      { content: `Logradouro: ${state.imovel_logradouro || ""}  Nº: ${state.imovel_numero || ""}  Complemento: ${state.imovel_complemento || ""}  Bairro: ${state.imovel_bairro || ""}`, colSpan: 2 },
    ],
    [{ content: `Cidade: ${state.imovel_cidade || ""}   CEP: ${state.imovel_cep || ""}`, colSpan: 2 }],
    [`Nome da edificação: ${state.nome_edificacao || c.razao_social || ""}`, `Nome da empresa: ${c.razao_social || ""}`],
    [{ content: `Detalhes (se houver): ${state.imovel_detalhes || ""}`, colSpan: 2 }],
  ];

  doc.autoTable({
    startY: startY + 3,
    theme: "grid",
    head: [],
    body,
    styles: { fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth / 2 }, 1: { cellWidth: contentWidth / 2 } },
    margin: { left: margin, right: MARGIN_RIGHT },
    // Idem — um "Detalhes" mais longo não deve partir a tabela ao meio; ou ela cabe
    // inteira aqui, ou desce inteira (com o RE, CNPJ etc. junto) pra próxima página.
    pageBreak: "avoid",
  });

  return doc.lastAutoTable.finalY + 8;
}

function statusSimNao(v: SistemaConformidade["conformePpci"]): string {
  return v === "sim" ? "SIM" : v === "nao" ? "NÃO" : "";
}

function drawRelatorioSistemas(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): number {
  // So quebra a pagina se nem o titulo tiver espaco — se as secoes 1 e 2 couberem
  // com folga na primeira pagina, essa tabela continua nela em vez de forçar uma
  // pagina nova sempre. `pageBreak: "avoid"` no autoTable abaixo garante que, se a
  // tabela toda nao couber a partir daqui, ela desce inteira pra proxima pagina em
  // vez de partir no meio.
  const startY = drawSecaoTitulo(doc, quebrarSeNecessario(doc, y, 25), "3. RELATÓRIO DOS SISTEMAS E MEDIDAS DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO");

  const porChave = new Map((state.sistemas || []).map((s) => [s.chave, s]));

  const head = [["Sistema", "PPCI", "NSCI", "Justificativa"]];
  const body = SISTEMAS_CONFORMIDADE.map(({ chave, label }) => {
    const s = porChave.get(chave);
    return [
      label,
      statusSimNao(s?.conformePpci ?? ""),
      statusSimNao(s?.conformeNsci ?? ""),
      s?.justificativa || (s?.conformePpci || s?.conformeNsci ? "" : "Não se aplica"),
    ];
  });

  doc.autoTable({
    startY: startY + 3,
    theme: "grid",
    head,
    body,
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold", halign: "center", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 1.5, textColor: 0, lineColor: 0, lineWidth: 0.2, valign: "middle" },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: contentWidth - 91 },
    },
    margin: { left: margin, right: MARGIN_RIGHT },
    pageBreak: "avoid",
  });

  return doc.lastAutoTable.finalY + 8;
}

function drawDeclaracaoAnexoI(doc: DocWithAutoTable, y: number, state: HabiteseWizardState): void {
  let cursorY = quebrarSeNecessario(doc, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const texto =
    "Na qualidade de responsável técnico pela execução dos SMSCI, declaro que as informações prestadas neste documento são verdadeiras e estou ciente de minha responsabilidade acerca dos SMSCI instalados no imóvel, conforme definido pela Lei Estadual nº 16.157 de 2013. Estou ciente que a concessão do atestado para habite-se está condicionada à existência e a operacionalidade dos SMSCI. O descumprimento ocasiona aplicação das sanções legais cabíveis, além de possível responsabilidade civil e criminal.";
  const linhas = doc.splitTextToSize(texto, contentWidth);
  doc.text(linhas, margin, cursorY);
  cursorY += linhas.length * 5 + 20;

  cursorY = quebrarSeNecessario(doc, cursorY);
  const rt = resolverRt(state);
  const agora = new Date(state.data_emissao || Date.now());
  const dataEmissao = agora.toLocaleDateString("pt-BR");
  const horaEmissao = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  doc.line(margin, cursorY, margin + 80, cursorY);
  doc.text("Assinatura do Responsável Técnico", margin, cursorY + 5);
  doc.text(rt.nome, margin, cursorY + 10);
  doc.text(`Data: ${dataEmissao}   Hora: ${horaEmissao}`, margin, cursorY + 15);
}

function nomeArquivoAnexoI(state: HabiteseWizardState): string {
  const nome = (state.cliente?.razao_social || "imovel").replace(/\s+/g, "_");
  return `Anexo_I_Relatorio_Conformidade_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/**
 * Gera o PDF do Anexo I (Relatório de conformidade e termo de responsabilidade
 * — ATESTADO PARA HABITE-SE, da IN 01/CBMSC) a partir dos mesmos dados do
 * Termo de Entrega. Cabeçalho oficial do CBMSC, sem identidade visual SC Fire.
 * Retorna o nome do arquivo gerado.
 */
export async function gerarPdfAnexoI(state: HabiteseWizardState): Promise<string> {
  const doc = new jsPDF() as DocWithAutoTable;

  let y = await drawCabecalhoOficialCBMSC(doc, "Relatório de conformidade e termo de responsabilidade - ATESTADO PARA HABITE-SE");
  y = drawResponsavelTecnicoAnexoI(doc, y, state);
  y = drawDescricaoImovelAnexoI(doc, y, state);
  y = drawRelatorioSistemas(doc, y, state);
  drawDeclaracaoAnexoI(doc, y, state);

  const fileName = nomeArquivoAnexoI(state);
  doc.save(fileName);
  return fileName;
}
