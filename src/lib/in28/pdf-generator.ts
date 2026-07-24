"use client";

/**
 * Geradores de PDF da IN 28 — Anexo C (Plano de Implementação de Brigada de
 * Incêndio — PIBI), Anexo E (Relatório anual — empresas de formação de
 * brigadistas) e Anexo F (Relatório anual — empresas de prestação de serviço
 * de brigadistas). Cabeçalho oficial do CBMSC.
 */

import { jsPDF } from "jspdf";
import { drawCabecalhoOficialCBMSC, drawCabecalhoInstitucional, desenharTabelaRotulos, carregarImagemComoDataUrl, MARGIN_TOP, MARGIN_LEFT, MARGIN_RIGHT, PAGE_WIDTH } from "../shared/pdf-branding";
import { quebrarSeNecessario } from "../shared/checklist-pdf";
import type { PibiState, RelatorioFormacaoState, RelatorioPrestacaoState } from "./types";

const margin = MARGIN_LEFT;
const contentWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

function desenharBlocoTexto(doc: jsPDF, y: number, titulo: string, texto: string | undefined): number {
  if (!texto) return y;
  let cursorY = quebrarSeNecessario(doc, y, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, margin, cursorY);
  cursorY += 5;
  doc.setFont("helvetica", "normal");
  const linhas = doc.splitTextToSize(texto, contentWidth);
  doc.text(linhas, margin, cursorY);
  return cursorY + linhas.length * 5 + 6;
}

function nomeArquivoPibi(state: PibiState, sufixo = ""): string {
  const nome = (state.razao_social || state.cliente?.razao_social || "imovel").replace(/\s+/g, "_");
  return `Anexo_C_PIBI_${state.codigo || "rascunho"}_${nome}${sufixo}.pdf`;
}

/** Desenha o corpo do PIBI (seções 1-4, planta/croquis e assinatura) — idêntico entre a via oficial CBMSC e a segunda via com identidade visual SC Fire; só o cabeçalho muda entre elas. */
async function desenharCorpoPibi(doc: jsPDF, yInicial: number, state: PibiState): Promise<number> {
  let y = yInicial;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. Dados do Imóvel/Evento", margin, y);
  y += 3;
  y = desenharTabelaRotulos(doc, y, [
    [
      { label: "Razão social", valor: state.razao_social || "" },
      { label: "Nome fantasia", valor: state.nome_fantasia || "" },
    ],
    [
      { label: "CNPJ", valor: state.cnpj || "" },
      { label: "Nº Registro Edificação CBMSC (RE)", valor: state.re || "" },
    ],
    [{ label: "Endereço", valor: `${state.endereco || ""}  Nº: ${state.numero || ""}  Complemento: ${state.complemento || ""}  Bairro: ${state.bairro || ""}` }],
    [{ label: "Cidade", valor: `${state.cidade || ""}   CEP: ${state.cep || ""}` }],
    [
      { label: "Ocupação", valor: state.ocupacao || "" },
      { label: "Telefone", valor: state.telefone || "" },
    ],
    [
      { label: "Área total construída (m²)", valor: state.area_construida || "" },
      { label: "Nº de pavimentos", valor: state.pavimentos || "" },
    ],
    [
      { label: "Altura (m)", valor: state.altura || "" },
      { label: "População fixa / Lotação máxima", valor: `${state.populacao_fixa || ""} / ${state.lotacao_maxima || ""}` },
    ],
  ]);
  y += 5;

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("2. Dados do Responsável pelo Imóvel/Evento", margin, y);
  y += 3;
  y = desenharTabelaRotulos(doc, y, [
    [
      { label: "Responsável", valor: state.responsavel_nome || "" },
      { label: "CPF", valor: state.responsavel_cpf || "" },
    ],
    [{ label: "Identidade", valor: state.responsavel_identidade || "" }],
    [{ label: "Endereço residencial", valor: `${state.responsavel_endereco || ""}  Nº: ${state.responsavel_numero || ""}` }],
    [
      { label: "Cidade/UF", valor: state.responsavel_cidade_uf || "" },
      { label: "Telefone", valor: state.responsavel_telefone || "" },
    ],
  ]);
  y += 5;

  y = quebrarSeNecessario(doc, y, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("3. Dados do Responsável Técnico", margin, y);
  y += 3;
  y = desenharTabelaRotulos(doc, y, [
    [
      { label: "Responsável técnico", valor: state.rt_nome || "" },
      { label: "CPF", valor: state.rt_cpf || "" },
    ],
    [
      { label: "Nº registro profissional", valor: state.rt_registro || "" },
      { label: "Atribuição", valor: state.rt_atribuicao || "" },
    ],
  ]);
  y += 5;

  y = quebrarSeNecessario(doc, y, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("4. Composição da Brigada de Incêndio", margin, y);
  y += 8;

  y = desenharBlocoTexto(doc, y, "Coordenador da Brigada (nome e cargo/função)", state.coordenador_brigada);
  y = desenharBlocoTexto(
    doc,
    y,
    `Brigadistas particulares (${state.brigadistas_particulares_qtd || "0"} por turno) — relação (nome e CPF) por turno`,
    state.brigadistas_particulares_relacao
  );
  y = desenharBlocoTexto(
    doc,
    y,
    `Brigadistas orgânicos (${state.brigadistas_organicos_qtd || "0"}, nível ${state.brigadistas_organicos_nivel || "-"}) — distribuição por bloco/setor/área`,
    state.brigadistas_organicos_distribuicao
  );

  y = desenharBlocoTexto(doc, y, "Sistema de Proteção Contra Incêndios Instalados", state.sistemas_protecao);
  y = desenharBlocoTexto(doc, y, "Outros Recursos Disponíveis", state.outros_recursos);
  y = desenharBlocoTexto(doc, y, "Procedimentos em Situação de Emergência", state.procedimentos_emergencia);
  y = desenharBlocoTexto(doc, y, "Ações de Prevenção", state.acoes_prevencao);
  y = desenharBlocoTexto(doc, y, "Outras Informações", state.outras_informacoes);

  if (state.planta_croqui?.length) {
    doc.addPage();
    y = MARGIN_TOP + 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PLANTA E CROQUIS", margin, y);
    y += 8;
    for (const img of state.planta_croqui) {
      const carregada = await carregarImagemComoDataUrl(img.url);
      if (!carregada) continue;
      const h = 120;
      y = quebrarSeNecessario(doc, y, h + 10);
      doc.addImage(carregada.dataUrl, carregada.format, margin, y, contentWidth, h, undefined, "MEDIUM");
      y += h + 6;
      if (img.legenda) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(img.legenda, margin, y);
        y += 8;
      }
    }
  }

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const dataEmissao = state.data_emissao ? new Date(state.data_emissao).toLocaleDateString("pt-BR") : "";
  doc.text(`${state.local_data || ""}, ${dataEmissao}`, margin, y);
  y += 15;
  doc.line(margin, y, margin + 80, y);
  y += 5;
  doc.text(`Assinatura: ${state.rt_nome || ""}`, margin, y);
  y += 5;
  doc.text("Nome completo do responsável técnico", margin, y);

  return y;
}

/** Gera o PDF do Anexo C — Plano de Implementação de Brigada de Incêndio (PIBI), IN 28/CBMSC. Via oficial, enviada ao CBMSC — cabeçalho institucional oficial, não alterar. */
export async function gerarPdfPibi(state: PibiState): Promise<string> {
  const doc = new jsPDF();

  const y = await drawCabecalhoOficialCBMSC(doc, "ANEXO C — Plano de Implementação de Brigada de Incêndio (PIBI)");
  await desenharCorpoPibi(doc, y, state);

  const fileName = nomeArquivoPibi(state);
  doc.save(fileName);
  return fileName;
}

/**
 * Segunda via do PIBI, com a identidade visual da SC Fire (logo + dados
 * institucionais no cabeçalho) em vez do cabeçalho oficial do CBMSC. Conteúdo
 * idêntico ao de gerarPdfPibi() — só o cabeçalho muda. Uso: cópia para o
 * cliente/arquivo interno; a via oficial enviada ao CBMSC continua sendo
 * gerarPdfPibi().
 */
export async function gerarPdfPibiIdentidadeVisual(state: PibiState): Promise<string> {
  const doc = new jsPDF();

  const y = await drawCabecalhoInstitucional(doc, "Plano de Implementação de Brigada de Incêndio (PIBI)", "ANEXO C — IN 28/CBMSC", state.codigo);
  await desenharCorpoPibi(doc, y, state);

  const fileName = nomeArquivoPibi(state, "_SCFire");
  doc.save(fileName);
  return fileName;
}

function desenharCabecalhoEmpresa(
  doc: jsPDF,
  y: number,
  state: { razao_social?: string; nome_fantasia?: string; cnpj?: string; num_credenciamento?: string; cidade?: string; bairro?: string; endereco?: string; numero?: string; complemento?: string; cep?: string; telefones?: string }
): number {
  return desenharTabelaRotulos(doc, y, [
    [
      { label: "Razão social", valor: state.razao_social || "" },
      { label: "Nome fantasia", valor: state.nome_fantasia || "" },
    ],
    [
      { label: "CNPJ", valor: state.cnpj || "" },
      { label: "Nº Credenciamento CBMSC", valor: state.num_credenciamento || "" },
    ],
    [{ label: "Endereço", valor: `${state.endereco || ""}  Nº: ${state.numero || ""}  Complemento: ${state.complemento || ""}` }],
    [
      { label: "Cidade/Bairro", valor: `${state.cidade || ""} / ${state.bairro || ""}` },
      { label: "CEP", valor: state.cep || "" },
    ],
    [{ label: "Telefones de contato", valor: state.telefones || "" }],
  ]);
}

function desenharDeclaracaoAssinatura(
  doc: jsPDF,
  y: number,
  state: { nome_responsavel_declaracao?: string; local_data?: string; data_emissao?: string }
): void {
  let cursorY = quebrarSeNecessario(doc, y, 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("3. Declaração", margin, cursorY);
  cursorY += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const texto = "Declaro para os devidos fins que as informações acima prestadas são verdadeiras e autênticas, assumindo total responsabilidade por seu teor.";
  const linhas = doc.splitTextToSize(texto, contentWidth);
  doc.text(linhas, margin, cursorY);
  cursorY += linhas.length * 5 + 8;

  const dataEmissao = state.data_emissao ? new Date(state.data_emissao).toLocaleDateString("pt-BR") : "";
  doc.text(`${state.local_data || ""}, ${dataEmissao}`, margin, cursorY);
  cursorY += 15;
  doc.line(margin, cursorY, margin + 80, cursorY);
  cursorY += 5;
  doc.text(`Nome do Proprietário/Diretor/Presidente: ${state.nome_responsavel_declaracao || ""}`, margin, cursorY);
}

/** Gera o PDF do Anexo E — Relatório de Atividades das Empresas de Formação de Brigadistas, IN 28/CBMSC. */
export async function gerarPdfRelatorioFormacao(state: RelatorioFormacaoState): Promise<string> {
  const doc = new jsPDF();

  let y = await drawCabecalhoOficialCBMSC(doc, `Anexo E — Relatório de Atividades do Ano de ${state.ano_referencia || "____"}\n(Empresas de Formação de Brigadistas)`);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. Dados da Empresa de Formação", margin, y);
  y += 3;
  y = desenharCabecalhoEmpresa(doc, y, state);
  y += 5;

  y = quebrarSeNecessario(doc, y, 40);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("2. Dados dos Cursos", margin, y);
  y += 3;
  y = desenharTabelaRotulos(doc, y, [
    [
      { label: "Turmas de brigadistas particulares", valor: state.turmas_particulares_qtd || "" },
      { label: "Brigadistas particulares formados", valor: state.brigadistas_particulares_qtd || "" },
    ],
    [
      { label: "Brigadistas nível básico", valor: state.brigadistas_organicos_basico_qtd || "" },
      { label: "Turmas nível básico", valor: state.turmas_basico_qtd || "" },
    ],
    [
      { label: "Brigadistas nível intermediário", valor: state.brigadistas_organicos_intermediario_qtd || "" },
      { label: "Turmas nível intermediário", valor: state.turmas_intermediario_qtd || "" },
    ],
    [
      { label: "Brigadistas nível avançado", valor: state.brigadistas_organicos_avancado_qtd || "" },
      { label: "Turmas nível avançado", valor: state.turmas_avancado_qtd || "" },
    ],
  ]);
  y += 5;

  y = desenharBlocoTexto(doc, y, "Quadro de instrutores (quantos e quem são)", state.instrutores);
  y = desenharBlocoTexto(doc, y, "Observações e Sugestões", state.observacoes_sugestoes);

  desenharDeclaracaoAssinatura(doc, y, state);

  const nome = (state.razao_social || "empresa").replace(/\s+/g, "_");
  const fileName = `Anexo_E_Relatorio_Formacao_${state.codigo || "rascunho"}_${nome}.pdf`;
  doc.save(fileName);
  return fileName;
}

/** Gera o PDF do Anexo F — Relatório de Atividades das Empresas de Prestação de Serviço de Brigadistas, IN 28/CBMSC. */
export async function gerarPdfRelatorioPrestacao(state: RelatorioPrestacaoState): Promise<string> {
  const doc = new jsPDF();

  let y = await drawCabecalhoOficialCBMSC(
    doc,
    `Anexo F — Relatório de Atividades do Ano de ${state.ano_referencia || "____"}\n(Empresas de Prestação de Serviço de Brigadistas)`
  );

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. Dados da Empresa", margin, y);
  y += 3;
  y = desenharCabecalhoEmpresa(doc, y, state);
  y += 5;

  y = quebrarSeNecessario(doc, y, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("2. Atividades Desenvolvidas", margin, y);
  y += 3;
  y = desenharTabelaRotulos(doc, y, [
    [
      { label: "Nº de eventos com concentração de público", valor: state.numero_eventos_concentracao || "" },
      { label: "Possui serviço de brigadista terceirizado", valor: state.possui_servico_terceirizado ? "SIM" : "NÃO" },
    ],
  ]);
  y += 5;

  y = desenharBlocoTexto(doc, y, "Relação dos brigadistas (nome e CPF)", state.relacao_brigadistas);
  y = desenharBlocoTexto(doc, y, "Observações e Sugestões", state.observacoes_sugestoes);

  desenharDeclaracaoAssinatura(doc, y, state);

  const nome = (state.razao_social || "empresa").replace(/\s+/g, "_");
  const fileName = `Anexo_F_Relatorio_Prestacao_${state.codigo || "rascunho"}_${nome}.pdf`;
  doc.save(fileName);
  return fileName;
}
