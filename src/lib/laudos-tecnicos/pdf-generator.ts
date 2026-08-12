"use client";

/**
 * Gerador de PDF dos Laudos Técnicos decorrentes da Inspeção de Regularidade
 * (IN 04) — um laudo por sistema preventivo: Extintores, SHP, Iluminação de
 * Emergência, Alarme e Estanqueidade da Rede de Gás. Estrutura narrativa
 * portada de laudos reais emitidos por terceiros ("Laudos das inspeções/"),
 * com cabeçalho e identidade visual SC Fire (drawCabecalhoInstitucional,
 * mesmo padrão dos demais módulos do hub).
 */

import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import {
  drawCabecalhoInstitucional,
  carregarImagemComoDataUrl,
  formatarRegistroProfissional,
  COR_CINZA_INSTITUCIONAL,
  MARGIN_TOP,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  PAGE_WIDTH,
  desenharTabelaRotulos,
} from "../shared/pdf-branding";
import { quebrarSeNecessario, type DocWithAutoTable } from "../shared/checklist-pdf";
import { formatarDataBR } from "../shared/date-format";
import { LAUDOS_TECNICOS_CONFIG, RESPONSAVEIS_TECNICOS } from "./constants";
import { resultadoAlarme, resultadoIluminacao, resultadoGas, resultadoExtintor, resultadoShp } from "./resultado";
import type { LaudoTecnicoWizardState, ResultadoMedicao } from "./types";

applyPlugin(jsPDF);

const margin = MARGIN_LEFT;
const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

function nomeArquivo(state: LaudoTecnicoWizardState): string {
  const nome = (state.cliente?.razao_social || "imovel").replace(/\s+/g, "_");
  return `Laudo_Tecnico_${state.tipo || "vistoria"}_${state.codigo || "rascunho"}_${nome}.pdf`;
}

/** RT agora e um Profissional cadastrado; a chave fixa "rt1"/"rt2" so aparece em laudos salvos antes dessa mudanca. */
function resolverRt(state: LaudoTecnicoWizardState): { nome: string; registro: string } {
  if (state.rt) {
    return {
      nome: state.rt.nome,
      registro: formatarRegistroProfissional({ nome: state.rt.nome, registroTipo: state.rt.registro_tipo, registroNumero: state.rt.registro_numero }),
    };
  }
  const fixo = RESPONSAVEIS_TECNICOS[state.rt_selecionado || "rt1"] ?? RESPONSAVEIS_TECNICOS.rt1;
  return { nome: fixo.nome, registro: fixo.classe };
}

function descricaoImovel(state: LaudoTecnicoWizardState): string {
  const c = state.cliente;
  if (!c) return "";
  const endereco = [c.logradouro, c.numero, c.bairro, c.cidade && c.estado ? `${c.cidade}/${c.estado}` : c.cidade].filter(Boolean).join(", ");
  return `${c.razao_social}, CNPJ/CPF: ${c.cnpj || c.cpf || "-"}, situado em ${endereco || "-"}${c.cep ? `, CEP: ${c.cep}` : ""}`;
}

function resultadoTexto(r: ResultadoMedicao): string {
  return r === "aprovado" ? "APROVADO" : r === "reprovado" ? "REPROVADO" : "-";
}

function desenharTituloSecao(doc: DocWithAutoTable, y: number, texto: string): number {
  const cursorY = quebrarSeNecessario(doc, y, 12);
  doc.setFontSize(11);
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

function tabelaResultados(state: LaudoTecnicoWizardState): { head: string[][]; body: string[][]; qtdReprovados: number } {
  const config = LAUDOS_TECNICOS_CONFIG[state.tipo || "alarme"];

  if (state.tipo === "extintor") {
    const linhas = state.medicoesExtintor ?? [];
    const body = linhas.map((m) => {
      const r = resultadoExtintor(m);
      return [m.identificacao || "-", m.tipoCapacidade || "-", formatarDataBR(m.validadeRecarga) || "-", formatarDataBR(m.validadeTesteHidrostatico) || "-", resultadoTexto(r)];
    });
    return { head: [[...config.colunasResultado, "Resultado"]], body, qtdReprovados: linhas.filter((m) => resultadoExtintor(m) === "reprovado").length };
  }

  if (state.tipo === "shp") {
    const linhas = state.medicoesShp ?? [];
    const body = linhas.map((m) => {
      const r = resultadoShp(m);
      return [m.identificacao || "-", m.pressaoDinamica || "-", m.vazaoLmin || "-", resultadoTexto(r)];
    });
    return { head: [[...config.colunasResultado, "Resultado"]], body, qtdReprovados: linhas.filter((m) => resultadoShp(m) === "reprovado").length };
  }

  if (state.tipo === "iluminacao") {
    const linhas = state.medicoesIluminacao ?? [];
    const body = linhas.map((m) => {
      const r = resultadoIluminacao(m);
      return [m.pavimento || "-", m.medicaoPlanoLux || "-", m.medicaoDesnivelLux || "-", resultadoTexto(r)];
    });
    return { head: [[...config.colunasResultado, "Resultado"]], body, qtdReprovados: linhas.filter((m) => resultadoIluminacao(m) === "reprovado").length };
  }

  if (state.tipo === "gas") {
    const linhas = state.medicoesGas ?? [];
    const body = linhas.map((m) => {
      const r = resultadoGas(m);
      return [m.redeTestada || "-", m.estanque === "sim" ? "Sim" : m.estanque === "nao" ? "Não" : "-", formatarDataBR(m.data) || "-", resultadoTexto(r)];
    });
    return { head: [[...config.colunasResultado, "Resultado"]], body, qtdReprovados: linhas.filter((m) => resultadoGas(m) === "reprovado").length };
  }

  const linhas = state.medicoesAlarme ?? [];
  const body = linhas.map((m) => {
    const r = resultadoAlarme(m);
    return [m.local || "-", m.nivelLocalDb || "-", m.nivelAlarmeDb || "-", resultadoTexto(r)];
  });
  return { head: [[...config.colunasResultado, "Resultado"]], body, qtdReprovados: linhas.filter((m) => resultadoAlarme(m) === "reprovado").length };
}

/** Fotos anexadas, sempre a partir de uma página nova — anexo do relatório. */
async function drawFotosAnexadas(doc: DocWithAutoTable, state: LaudoTecnicoWizardState): Promise<void> {
  const imagens = state.imagens ?? [];
  if (imagens.length === 0) return;

  doc.addPage();
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("EVIDÊNCIA FOTOGRÁFICA DE AMOSTRAGEM", margin, MARGIN_TOP + 10);
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

/** Gera o PDF do Laudo Técnico (Extintor/SHP/Iluminação/Alarme/Gás) e dispara o download. */
export async function gerarPdfLaudoTecnico(state: LaudoTecnicoWizardState): Promise<string> {
  const tipo = state.tipo || "alarme";
  const config = LAUDOS_TECNICOS_CONFIG[tipo];
  const doc = new jsPDF() as DocWithAutoTable;
  let secao = 0;
  const proximaSecao = () => ++secao;

  let y = await drawCabecalhoInstitucional(doc, config.titulo, config.subtitulo, state.codigo);

  const rt = resolverRt(state);

  y = desenharTabelaRotulos(doc, y, [
    [{ label: "Cliente", valor: state.cliente?.razao_social || "" }],
    [
      { label: "CNPJ/CPF", valor: state.cliente?.cnpj || state.cliente?.cpf || "" },
      { label: "RE", valor: state.cliente?.re || "" },
    ],
    [{ label: "Localização", valor: [state.cliente?.logradouro, state.cliente?.numero, state.cliente?.bairro, state.cliente?.cidade && state.cliente?.estado ? `${state.cliente.cidade}/${state.cliente.estado}` : state.cliente?.cidade].filter(Boolean).join(", ") }],
    [
      { label: "Data da vistoria", valor: formatarDataBR(state.data_vistoria) },
      { label: "Responsável Técnico", valor: rt.nome },
    ],
  ]);
  y += 5;

  y = desenharTituloSecao(doc, y, `${proximaSecao()}. Apresentação`);
  y = desenharParagrafo(doc, y, config.apresentacao);

  y = desenharTituloSecao(doc, y, `${proximaSecao()}. Objetivo`);
  y = desenharParagrafo(doc, y, config.objetivo(descricaoImovel(state)));

  y = desenharTituloSecao(doc, y, `${proximaSecao()}. Referências Normativas`);
  y = desenharParagrafo(doc, y, config.referencias);

  y = desenharTituloSecao(doc, y, `${proximaSecao()}. Descritivo do Instrumento Utilizado na Medição`);
  const linhasInstrumento: string[] = [];
  if (state.instrumento) linhasInstrumento.push(state.instrumento);
  if (state.numeroSerie) linhasInstrumento.push(`Nº de série: ${state.numeroSerie}`);
  if (state.certificadoCalibracao) linhasInstrumento.push(`Certificado de calibração: ${state.certificadoCalibracao}`);
  if (state.artNumero) linhasInstrumento.push(`ART nº: ${state.artNumero}`);
  y = desenharParagrafo(doc, y, linhasInstrumento.join(" — ") || "-");

  if (tipo === "gas") {
    y = desenharTituloSecao(doc, y, `${proximaSecao()}. Condições do Teste`);
    y = desenharTabelaRotulos(doc, y, [
      [
        { label: "Pressão inicial (Kgf/cm²)", valor: state.gasPressaoInicialKgf || "" },
        { label: "Pressão final (Kgf/cm²)", valor: state.gasPressaoFinalKgf || "" },
      ],
      [
        { label: "Horário de início", valor: state.gasHorarioInicio || "" },
        { label: "Horário de término", valor: state.gasHorarioTermino || "" },
      ],
    ]);
    y += 5;
  }

  y = desenharTituloSecao(doc, y, `${proximaSecao()}. Resultados das Medições`);
  const { head, body, qtdReprovados } = tabelaResultados(state);
  if (body.length === 0) {
    y = desenharParagrafo(doc, y, "Nenhuma medição foi lançada nesta vistoria.");
  } else {
    doc.autoTable({
      startY: y,
      theme: "grid",
      head,
      body,
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold", halign: "center", fontSize: 7.5 },
      styles: { fontSize: 8, cellPadding: 1.8, textColor: 0, lineColor: 0, lineWidth: 0.2, valign: "middle", halign: "center" },
      margin: { left: margin, right: MARGIN_RIGHT },
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  y = desenharTituloSecao(doc, y, `${proximaSecao()}. Conclusão`);
  y = desenharParagrafo(doc, y, qtdReprovados > 0 ? config.conclusaoReprovado(qtdReprovados) : config.conclusaoAprovado);

  if (state.observacoes) {
    y = desenharTituloSecao(doc, y, "Observações Gerais");
    y = desenharParagrafo(doc, y, state.observacoes);
  }

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const dataEmissao = state.data_emissao ? new Date(state.data_emissao).toLocaleDateString("pt-BR") : "";
  doc.text(`Florianópolis, ${dataEmissao}.`, margin, y);
  y += 20;

  y = quebrarSeNecessario(doc, y, 20);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, y, margin + 80, y);
  doc.text(rt.nome, margin, y + 5);
  doc.setFontSize(8);
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text(`Responsável Técnico — ${rt.registro}`, margin, y + 9);

  const x2 = margin + contentWidth - 80;
  doc.line(x2, y, x2 + 80, y);
  doc.setFontSize(8);
  doc.setTextColor(...COR_CINZA_INSTITUCIONAL);
  doc.text("Responsável pela edificação", x2, y + 5);

  await drawFotosAnexadas(doc, state);

  const fileName = nomeArquivo(state);
  doc.save(fileName);
  return fileName;
}
