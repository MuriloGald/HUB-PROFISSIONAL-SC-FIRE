"use client";

/**
 * Gerador de PDF utilizando jsPDF e jsPDF-AutoTable — gera documentos no
 * formato exato dos Anexos do CBMSC (IN 24).
 * Porte de js/utils/pdf-generator.js do app legado Laudos_de_eventos_SCFire.
 */

import { jsPDF } from "jspdf";
import { applyPlugin, type RowInput } from "jspdf-autotable";
import { RESPONSAVEIS_TECNICOS, EMPRESA, PERGUNTAS_MAP } from "./constants";
import type { EventoWizardState, Respostas } from "./types";

applyPlugin(jsPDF);

type DocWithAutoTable = jsPDF & {
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable: { finalY: number };
};

const margin = 14;
const pageWidth = 210; // A4 largura em mm
const contentWidth = pageWidth - margin * 2;

// jspdf-autotable v5 nao aceita mais cellWidth em porcentagem (so 'auto' | 'wrap' | numero em mm),
// diferente da versao 3.x usada no app legado — por isso os valores abaixo em mm.

function drawHeader(doc: DocWithAutoTable, title: string, subtitle: string): number {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, margin + 10, { align: "center" });

  doc.setFontSize(10);
  doc.text(subtitle, pageWidth / 2, margin + 16, { align: "center" });

  return margin + 25;
}

function drawIdentificacao(doc: DocWithAutoTable, startY: number, state: EventoWizardState): number {
  const c = state.cliente || ({} as NonNullable<EventoWizardState["cliente"]>);
  const rtKey =
    state.respostas_pequeno?.rt_selecionado ||
    state.respostas_medio?.rt_selecionado ||
    state.respostas_grande?.rt_selecionado ||
    "rt1";
  const rt = RESPONSAVEIS_TECNICOS[rtKey];

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. IDENTIFICAÇÃO DO EVENTO", margin, startY);

  const bodyData: RowInput[] = [
    [{ content: `Nome do evento: ${state.nome_evento || ""}`, colSpan: 2 }],
    [{ content: `Descrição do evento: ${state.descricao_evento || ""}`, colSpan: 2 }],
    [
      `Início: ${state.data_inicio || ""} Horário: ${state.hora_inicio || ""}h`,
      `Encerramento: ${state.data_termino || ""} Horário: ${state.hora_termino || ""}h`,
    ],
    [{ content: `Público total previsto: ${state.publico || ""} pessoas`, colSpan: 2 }],
    [`End.: ${state.logradouro_evento || ""}, Nº ${state.numero_evento || ""}`, `CEP: ${state.cep_evento || ""}`],
    [`Bairro: ${state.bairro_evento || ""}`, `Cidade: ${state.cidade_evento || ""}`],
    [{ content: `Complemento/Ponto de referência: ${state.complemento_evento || ""}`, colSpan: 2 }],
    [
      `Responsável pelo Evento: ${c.razao_social || ""} (CPF/CNPJ: ${c.cnpj || c.cpf || ""})`,
      `Fone: ${c.telefone || ""}`,
    ],
  ];

  if (state.porteFinal !== "pequeno") {
    bodyData.push([`Responsável Técnico: ${rt.nome}`, `CPF: ${rt.cpf}\nFone: ${rt.telefone}`]);
  }

  bodyData.push(
    [{ content: "Quadro de áreas", colSpan: 2, styles: { halign: "center", fillColor: [240, 240, 240], fontStyle: "bold" } }],
    [{ content: `Área total utilizada no evento: ${state.area_total || ""} m²`, colSpan: 2 }],
    [{ content: `Área das instalações permanentes: ${state.area_permanente || ""} m²`, colSpan: 2 }],
    [{ content: `Área das estruturas provisórias: ${state.area_provisoria || ""} m²`, colSpan: 2 }]
  );

  doc.autoTable({
    startY: startY + 3,
    theme: "grid",
    head: [],
    body: bodyData,
    styles: { fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth / 2 }, 1: { cellWidth: contentWidth / 2 } },
  });

  return doc.lastAutoTable.finalY + 10;
}

interface MapOrdemItem {
  type?: "header";
  label?: string;
  key?: string;
  embedVal?: string;
  selfEmbed?: boolean;
}

function montarMapOrdem(porte: EventoWizardState["porteFinal"]): MapOrdemItem[] {
  if (porte === "pequeno") {
    return [
      { type: "header", label: "Características gerais" },
      { key: "CGPP01" }, { key: "CGPP02" }, { key: "CGPP03" }, { key: "CGPP04" },
      { type: "header", label: "Estruturas provisórias" },
      { key: "PROVISORIAPP01" }, { key: "PROVISORIAPP02" }, { key: "PROVISORIAPP03" }, { key: "PROVISORIAPP04" },
      { type: "header", label: "Instalações de Gás Combustível" },
      { key: "GLPPP" },
    ];
  }
  if (porte === "medio") {
    return [
      { type: "header", label: "Características gerais" },
      { key: "CGMP01" }, { key: "CGMP02" }, { key: "CGMP03" }, { key: "CGMP04" },
      { type: "header", label: "Estruturas provisórias" },
      { key: "EPMP01" }, { key: "EPMP02" }, { key: "EPMP03" }, { key: "EPMP04" }, { key: "EPMP05" }, { key: "EPMP06" }, { key: "EPMP07" }, { key: "EPMP08" },
      { type: "header", label: "SMSCI" },
      { key: "SMSCIMP01", embedVal: "GAS" }, { key: "SMSCIMP02" }, { key: "SMSCIMP03" }, { key: "SMSCIMP04" }, { key: "SMSCIMP05" }, { key: "SMSCIMP06" }, { key: "SMSCIMP07" }, { key: "SMSCIMP08" }, { key: "SMSCIMP09" }, { key: "SMSCIMP10" }, { key: "SMSCIMP11" }, { key: "SMSCIMP12" }, { key: "SMSCIMP13" },
      { type: "header", label: "Equipamentos" },
      { key: "DEA" },
      { type: "header", label: "Documentação" },
      { key: "DOCMP" },
    ];
  }
  return [
    { type: "header", label: "Características gerais" },
    { key: "CGGP01" }, { key: "CGGP02" }, { key: "CGGP03" },
    { type: "header", label: "Estruturas provisórias" },
    { key: "PROVISORIAGP01" }, { key: "PROVISORIAGP02" }, { key: "PROVISORIAGP03" }, { key: "PROVISORIAGP04" }, { key: "PROVISORIAGP05" }, { key: "PROVISORIAGP06" }, { key: "PROVISORIAGP07" }, { key: "PROVISORIAGP08" },
    { type: "header", label: "Instalações de Gás Combustível" },
    { key: "GLPGP01", embedVal: "GAS" }, { key: "GLPGP02" }, { key: "GLPGP03" },
    { type: "header", label: "Sistema Preventivo por Extintores" },
    { key: "EXTGP1" }, { key: "EXTGP02_QTD", selfEmbed: true }, { key: "EXTGP03_QTD", selfEmbed: true },
    { type: "header", label: "Saídas de Emergência" },
    { key: "SEGP01" }, { key: "AMBFEC", selfEmbed: true }, { key: "SEGP03" }, { key: "SEGP04" }, { key: "SEGP05" }, { key: "SEGP06" }, { key: "SEGP07" }, { key: "SEGP08" }, { key: "SEGP09" }, { key: "SEGP10" }, { key: "SEGP11" }, { key: "CONTROLE" }, { key: "SEGP12" }, { key: "SEGP13" }, { key: "SEGP14" }, { key: "SEGP15", embedVal: "INCRAMP" }, { key: "SEGP16" }, { key: "SEGP17" },
    { type: "header", label: "Sistema de Iluminação de Emergência" },
    { key: "SIEGP01" }, { key: "SIEGP02" }, { key: "SIEGP03" }, { key: "LUM", selfEmbed: true },
    { type: "header", label: "Sinalização para Abandono de Local" },
    { key: "SALGP01" }, { key: "SALGP02" }, { key: "SALGP03", embedVal: "PLACA" }, { key: "SALGP04" }, { key: "SALGP05" },
    { type: "header", label: "Demais Sistemas e Documentos" },
    { key: "DEMAISGP01" }, { key: "DEMAISGP02" }, { key: "DEMAISGP03" }, { key: "DEMAISGP04", embedVal: "BRIG" }, { key: "DEMAISGP05" }, { key: "DEMAISGP06" }, { key: "DEMAISGP07" },
    { type: "header", label: "Equipamentos" },
    { key: "EQUIPSGP" },
    { type: "header", label: "Documentação" },
    { key: "DOCGP" },
  ];
}

function statusDisplay(answer: string): string {
  if (answer === "sim") return "SIM";
  if (answer === "nao") return "NÃO";
  if (answer === "na") return "NA";
  if (answer === "manual_auto") return "MANUAL/AUTO";
  if (answer === "automatizado") return "AUTOMATIZADO";
  return answer;
}

function drawCaracteristicas(
  doc: DocWithAutoTable,
  startY: number,
  state: EventoWizardState,
  respostas: Respostas,
  numSection = 2
): number {
  let finalY = startY;
  if (startY > 250) {
    doc.addPage();
    finalY = margin + 10;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`${numSection}. CARACTERÍSTICAS DO EVENTO / SEGURANÇA CONTRA INCÊNDIO`, margin, finalY);

  const bodyData: RowInput[] = [];
  const mapOrdem = montarMapOrdem(state.porteFinal);

  mapOrdem.forEach((item) => {
    if (item.type === "header") {
      bodyData.push([
        { content: item.label!, styles: { halign: "center", fillColor: [240, 240, 240], fontStyle: "bold" } },
        { content: "Status", styles: { halign: "center", fillColor: [240, 240, 240], fontStyle: "bold" } },
      ]);
      return;
    }

    const key = item.key!;
    const answer = respostas[key] || "";
    let status = item.selfEmbed ? "" : statusDisplay(answer);

    let questionText = PERGUNTAS_MAP[key] || key;

    if (item.embedVal) {
      const embedAnswer = respostas[item.embedVal] || "___";
      questionText = questionText.replace("{{VAL}}", embedAnswer);
    } else if (item.selfEmbed) {
      questionText = questionText.replace("{{VAL}}", answer || "___");
      status = "";
    }

    bodyData.push([questionText, { content: status, styles: { halign: "center", fontStyle: "bold" } }]);
  });

  if (respostas.OBS) {
    bodyData.push([
      { content: `Observações: ${respostas.OBS}`, colSpan: 2, styles: { halign: "justify", fontStyle: "normal", fillColor: 255 } },
    ]);
  }

  doc.autoTable({
    startY: finalY + 3,
    theme: "grid",
    head: [],
    body: bodyData,
    styles: { fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth * 0.85 }, 1: { cellWidth: contentWidth * 0.15 } },
  });

  return doc.lastAutoTable.finalY + 10;
}

function drawTabelaSaidas(doc: DocWithAutoTable, startY: number, state: EventoWizardState, numSection = 3): number {
  let finalY = startY;
  if (startY > 250) {
    doc.addPage();
    finalY = margin + 10;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`${numSection}. TABELA DE DIMENSIONAMENTO DAS SAÍDAS DE EMERGÊNCIA`, margin, finalY);

  let locaisArray: Record<string, string>[] = [];
  try {
    const locaisStr = state.respostas_grande?.locais || "[]";
    locaisArray = JSON.parse(locaisStr);
  } catch {
    // ignora JSON invalido
  }

  if (locaisArray.length === 0) {
    locaisArray.push({ nome: "Não informado", boate: "-", carac: "-", publico: "-", area: "-", distancia: "-", qtd: "-", largura: "-" });
  }

  const head = [["Nome do Local", "Boate/Show Musical", "Características", "Público", "Área (m²)", "Distância (m)", "Qtd. Saídas", "Largura (m)"]];
  const body = locaisArray.map((l) => [l.nome, l.boate, l.carac, l.publico, l.area, l.distancia, l.qtd, l.largura]);

  doc.autoTable({
    startY: finalY + 3,
    theme: "grid",
    head,
    body,
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold", halign: "center", fontSize: 7, cellPadding: 1 },
    styles: { fontSize: 8, cellPadding: 1, textColor: 0, lineColor: 0, lineWidth: 0.2, halign: "center", valign: "middle" },
    columnStyles: {
      0: { cellWidth: 30 }, 1: { cellWidth: 20 }, 2: { cellWidth: 40 }, 3: { cellWidth: 15 },
      4: { cellWidth: 20 }, 5: { cellWidth: 20 }, 6: { cellWidth: 17 }, 7: { cellWidth: 20 },
    },
  });

  return doc.lastAutoTable.finalY + 10;
}

function drawAssinaturas(doc: DocWithAutoTable, startYInput: number, state: EventoWizardState, tipo: "pequeno" | "medio" | "grande"): void {
  const c = state.cliente || ({} as NonNullable<EventoWizardState["cliente"]>);
  const rtKey =
    state.respostas_pequeno?.rt_selecionado ||
    state.respostas_medio?.rt_selecionado ||
    state.respostas_grande?.rt_selecionado ||
    "rt1";
  const rt = RESPONSAVEIS_TECNICOS[rtKey];

  let startY = startYInput;
  if (startY > 250) {
    doc.addPage();
    startY = margin + 10;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  if (tipo === "pequeno") {
    doc.text("3. TERMO DE RESPONSABILIDADE", margin, startY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const texto1 =
      "Declaro junto ao Corpo de Bombeiros Militar de Santa Catarina (CBMSC) que estou ciente e assumo total responsabilidade pelas informações do evento temporário acima descritas, as quais enquadram o evento como sendo de Pequeno Porte, conforme a Instrução Normativa (IN) 24 do CBMSC, e que possuo o dever legal de garantir as condições de segurança do local, adotando, operacionalizando e disponibilizando os Sistemas e Medidas de Segurança Contra Incêndio (SMSCI) para o evento de acordo com as Normas de Segurança Contra Incêndio do CBMSC, em especial o artigo 18 da IN 24.";
    const texto2 =
      "Declaro ainda estar ciente que o descumprimento das NSCI ou à inveracidade das informações prestadas ensejam infração administrativa, conforme Lei Estadual 13.157/2013, podendo ainda responder civil e criminalmente conforme a legislação vigente.";

    doc.text(texto1, margin, startY + 5, { maxWidth: pageWidth - margin * 2 });
    doc.text(texto2, margin, startY + 25, { maxWidth: pageWidth - margin * 2 });

    const dataEmissao = new Date(state.data_emissao || Date.now());
    const dataFormatada = dataEmissao.toLocaleDateString("pt-BR");
    const cidade = EMPRESA.cidade || "Florianópolis";
    const textoLocalData = `${cidade}, ${dataFormatada}`;

    doc.text(textoLocalData, margin + 5, startY + 54);
    doc.text("________________________________", margin, startY + 55);
    doc.text("Local e data", margin + 18, startY + 60);

    doc.line(pageWidth - margin - 70, startY + 55, pageWidth - margin, startY + 55);
    doc.text("Assinatura do Responsável", pageWidth - margin - 35, startY + 60, { align: "center" });

    const nomeResponsavel = c.razao_social || "";
    if (nomeResponsavel) {
      doc.text(`(${nomeResponsavel})`, pageWidth - margin - 35, startY + 64, { align: "center", maxWidth: 65 });
    }
  } else {
    doc.text("3. RESPONSÁVEIS PELO EVENTO", margin, startY);

    const rtData: RowInput[] = [
      [
        { content: "RESPONSÁVEL TÉCNICO PELO LAUDO TÉCNICO", styles: { fillColor: [240, 240, 240], fontStyle: "bold" } },
        { content: `Nº documento de RT: ${rt.nr_rt}`, styles: { fillColor: [240, 240, 240] } },
      ],
      [`Nome: ${rt.nome}`, `Nº C. Classe: ${rt.classe}`],
      [`End.: ${EMPRESA.endereco}, ${EMPRESA.numero}`, `CEP: ${EMPRESA.cep}`],
      [`Bairro: ${EMPRESA.bairro}`, `Cidade: ${EMPRESA.cidade}`],
      [{ content: `Complemento: ${EMPRESA.complemento}`, colSpan: 2 }],
      [`E-mail: ${EMPRESA.email}`, `Telefone: ${EMPRESA.telefone}`],
      [{ content: "\n\n_____________________________________\nAssinatura do RT", colSpan: 2, styles: { halign: "center", minCellHeight: 25 } }],
      [{ content: "RESPONSÁVEL PELO EVENTO", colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: "bold" } }],
      [`Nome: ${c.razao_social || ""}`, `CPF/CNPJ: ${c.cnpj || c.cpf || ""}`],
      [`End.: ${c.logradouro || ""}, Nº ${c.numero || ""}`, `CEP: ${c.cep || ""}`],
      [`Bairro: ${c.bairro || ""}`, `Cidade: ${c.cidade || ""}`],
      [{ content: `Complemento: ${c.complemento || ""}`, colSpan: 2 }],
      [`E-mail: ${c.email || ""}`, `Telefone: ${c.telefone || ""}`],
      [{ content: "\n\n_____________________________________\nAssinatura do Responsável", colSpan: 2, styles: { halign: "center", minCellHeight: 25 } }],
    ];

    doc.autoTable({
      startY: startY + 3,
      theme: "grid",
      head: [],
      body: rtData,
      styles: { fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.2 },
      columnStyles: { 0: { cellWidth: contentWidth * 0.6 }, 1: { cellWidth: contentWidth * 0.4 } },
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    if (finalY > 230) {
      doc.addPage();
      finalY = margin + 10;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("4. TERMO DE RESPONSABILIDADE DO RESPONSÁVEL TÉCNICO", margin, finalY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const texto = `Declaro junto ao Corpo de Bombeiros Militar de Santa Catarina (CBMSC) que estou ciente e assumo total responsabilidade pelas informações do evento temporário acima descritas, as quais enquadram o evento como sendo de ${
      tipo === "medio" ? "Médio Porte" : "Grande Porte"
    }, conforme a Instrução Normativa (IN) 24 do CBMSC.\n\nAtesto que os SMSCI do evento, bem como eventuais estruturas montadas, estão corretamente previstos, dimensionados e serão instalados de acordo com as NSCI, estando em pleno funcionamento durante a realização do evento.\n\nDeclaro ainda estar ciente que o descumprimento das NSCI ou à inveracidade das informações prestadas ensejam infração administrativa, conforme Lei Estadual 13.157/2013, podendo ainda responder civil e criminalmente conforme a legislação vigente.`;
    doc.text(texto, margin, finalY + 5, { maxWidth: pageWidth - margin * 2, align: "justify" });

    const dataEmissao = new Date(state.data_emissao || Date.now());
    const dataFormatada = dataEmissao.toLocaleDateString("pt-BR");
    const cidade = EMPRESA.cidade || "Florianópolis";
    const textoLocalData = `${cidade}, ${dataFormatada}`;

    doc.text(textoLocalData, margin + 5, finalY + 44);
    doc.text("________________________________", margin, finalY + 45);
    doc.text("Local e data", margin + 18, finalY + 50);

    doc.text("__________________________________________", pageWidth - margin - 70, finalY + 45);
    doc.text("Assinatura do RT", pageWidth - margin - 50, finalY + 50);
  }
}

const mapAnexoE: MapOrdemItem[] = [
  { type: "header", label: "Documentação" },
  { key: "LADOC" }, { key: "DOCGP" },
  { type: "header", label: "Estruturas provisórias" },
  { key: "PROVISORIAGP03" },
  { type: "header", label: "Instalações de Gás Combustível" },
  { key: "GLPGP03" }, { key: "GLPGP02" },
  { type: "header", label: "Sistema Preventivo por Extintores" },
  { key: "EXTGP02_QTD", selfEmbed: true }, { key: "EXTGP03_QTD", selfEmbed: true }, { key: "EXTGP1" },
  { type: "header", label: "Saídas de Emergência" },
  { key: "SEGP01" }, { key: "LASE" }, { key: "SEGP05" }, { key: "SEGP06" }, { key: "SEGP07" }, { key: "SEGP08" }, { key: "SEGP09" }, { key: "SEGP10" }, { key: "SEGP11" }, { key: "CONTROLE" }, { key: "SEGP12" }, { key: "SEGP13" }, { key: "SEGP14" }, { key: "SEGP15", embedVal: "INCRAMP" }, { key: "SEGP16" }, { key: "SEGP17" },
  { type: "header", label: "Sistema de Iluminação de Emergência" },
  { key: "LASIE" }, { key: "SIEGP03" }, { key: "LUM", selfEmbed: true },
  { type: "header", label: "Sinalização para Abandono de Local" },
  { key: "SALGP02" }, { key: "SALGP03", embedVal: "PLACA" }, { key: "LASAL" }, { key: "SALGP05" },
  { type: "header", label: "Demais normativas" },
  { key: "LADE1" }, { key: "DEMAISGP03" }, { key: "DEMAISGP04", embedVal: "BRIG" }, { key: "DEMAISGP05" }, { key: "LADE2" },
  { type: "header", label: "Prevenção em Espetáculos Pirotécnicos" },
  { key: "TEM_PIRO" }, { key: "LAPIRO1" }, { key: "LAPIRO2" }, { key: "LAPIRO3" }, { key: "LAPIRO4" }, { key: "LAPIRO5" },
  { type: "header", label: "Equipamentos" },
  { key: "EQUIPSGP" },
];

function drawAnexoE(doc: DocWithAutoTable, state: EventoWizardState): void {
  let currentY = drawHeader(doc, "Anexo E - Laudo de Comissionamento", "EVENTO DE GRANDE PORTE");
  currentY = drawIdentificacao(doc, currentY, state);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("2. SEGURANÇA CONTRA INCÊNDIO E PÂNICO DO EVENTO", margin, currentY);
  currentY += 5;

  const respostasE = state.respostas_grande || {};
  const bodyDataE: RowInput[] = [];

  mapAnexoE.forEach((item) => {
    if (item.type === "header") {
      bodyDataE.push([
        { content: item.label!, styles: { halign: "center", fillColor: [240, 240, 240], fontStyle: "bold" } },
        { content: "Status", styles: { halign: "center", fillColor: [240, 240, 240], fontStyle: "bold" } },
      ]);
      return;
    }

    const key = item.key!;
    let answer = respostasE[key] || "";

    if (respostasE.TEM_PIRO !== "sim" && key.startsWith("LAPIRO")) {
      answer = "na";
    }
    let status = item.selfEmbed ? "" : statusDisplay(answer);

    let questionText = PERGUNTAS_MAP[key] || key;

    if (item.embedVal) {
      const embedAnswer = respostasE[item.embedVal] || "___";
      questionText = questionText.replace("{{VAL}}", embedAnswer);
    } else if (item.selfEmbed) {
      questionText = questionText.replace("{{VAL}}", answer || "___");
      status = "";
    }

    // Formatacao especial: soma os dois tipos de extintores em uma unica linha
    if (key === "EXTGP02_QTD") {
      const q1 = respostasE.EXTGP02_QTD || "0";
      const q2 = respostasE.EXTGP03_QTD || "0";
      questionText = `Informe a quantidade total de extintores instalados no evento (portáteis e sobrerrodas): ${parseInt(q1) + parseInt(q2)} extintores.`;
    }
    if (key === "EXTGP03_QTD") return; // ja foi somado na linha acima

    bodyDataE.push([questionText, { content: status, styles: { halign: "center", fontStyle: "bold" } }]);
  });

  if (respostasE.OBS) {
    bodyDataE.push([
      { content: `Observações: ${respostasE.OBS}`, colSpan: 2, styles: { halign: "justify", fontStyle: "normal", fillColor: 255 } },
    ]);
  }

  doc.autoTable({
    startY: currentY + 3,
    theme: "grid",
    head: [],
    body: bodyDataE,
    styles: { fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.2 },
    columnStyles: { 0: { cellWidth: contentWidth * 0.85 }, 1: { cellWidth: contentWidth * 0.15 } },
  });

  currentY = doc.lastAutoTable.finalY + 10;
  drawAssinaturas(doc, currentY, state, "grande");
}

function nomeArquivo(state: EventoWizardState, sufixo = ""): string {
  const nome = (state.nome_evento || "evento").replace(/ /g, "_");
  return `Laudo_${state.porteFinal}_${nome}${sufixo}.pdf`;
}

export type TipoPdf = "ambos" | "anexod" | "anexoe";

/** Gera o(s) PDF(s) do laudo e dispara o download no navegador. Retorna o(s) nome(s) de arquivo gerado(s). */
export function gerarPdf(state: EventoWizardState, tipoPdf: TipoPdf = "ambos"): string | (string | null)[] | null {
  const doc = new jsPDF() as DocWithAutoTable;
  const porte = state.porteFinal;
  let currentY = margin;

  if (porte === "pequeno") {
    currentY = drawHeader(doc, "Anexo B - Termo de Responsabilidade", "EVENTO DE PEQUENO PORTE");
    currentY = drawIdentificacao(doc, currentY, state);
    currentY = drawCaracteristicas(doc, currentY, state, state.respostas_pequeno || {});
    drawAssinaturas(doc, currentY, state, "pequeno");

    const fileName = nomeArquivo(state);
    doc.save(fileName);
    return fileName;
  }

  if (porte === "medio") {
    currentY = drawHeader(doc, "Anexo C - Laudo técnico", "EVENTO DE MÉDIO PORTE");
    currentY = drawIdentificacao(doc, currentY, state);
    currentY = drawCaracteristicas(doc, currentY, state, state.respostas_medio || {});
    drawAssinaturas(doc, currentY, state, "medio");

    const fileName = nomeArquivo(state);
    doc.save(fileName);
    return fileName;
  }

  // GRANDE PORTE — Anexo D (memorial) + Anexo E (comissionamento)
  let fileNameD: string | null = null;
  if (tipoPdf === "ambos" || tipoPdf === "anexod") {
    currentY = drawHeader(doc, "Anexo D - Memorial Técnico de Segurança Contra Incêndio", "EVENTO DE GRANDE PORTE");
    currentY = drawIdentificacao(doc, currentY, state);
    currentY = drawCaracteristicas(doc, currentY, state, state.respostas_grande || {}, 2);
    currentY = drawTabelaSaidas(doc, currentY, state, 3);
    drawAssinaturas(doc, currentY, state, "grande");

    fileNameD = nomeArquivo(state, "_AnexoD");
    doc.save(fileNameD);

    if (tipoPdf === "anexod") return fileNameD;
  }

  if (tipoPdf === "ambos" || tipoPdf === "anexoe") {
    const docE = (tipoPdf === "ambos" ? new jsPDF() : doc) as DocWithAutoTable;
    drawAnexoE(docE, state);

    const fileNameE = nomeArquivo(state, "_AnexoE");
    docE.save(fileNameE);

    return [fileNameD, fileNameE];
  }

  return fileNameD;
}
