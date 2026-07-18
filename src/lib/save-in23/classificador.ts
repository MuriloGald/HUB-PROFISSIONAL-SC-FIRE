/**
 * Motor de classificacao da dispensa do PBD — Art. 6º da IN 23/CBMSC (SAVE).
 * Porta avaliarSetor() do app legado (Index.html do "App Vistoria e Laudo"),
 * cross-checado com o texto integral do Art. 6º (caput, incisos I-IV, §§ 1º-5º).
 */

import type { Alteracao, OcupacaoArt6, SetorVistoria, VentilacaoNatural } from "./types";
import { OCUPACOES_ART6 } from "./types";
import { CRITERIOS_ADEQUACAO } from "./constants";

export type Enquadramento = "I" | "II" | "III" | "IV-a" | "IV-b" | null;

export interface VentilacaoResultado {
  pctArea: number | null;
  pctPerimetro: number | null;
  ok: boolean;
}

/**
 * Calcula os dois percentuais exigidos pelo § 1º do Art. 6º e se ambos, somados ao
 * requisito de abertura em pelo menos 2 lados, atendem a ventilacao natural:
 *   I  - area das aberturas >= 20% da area total das fachadas externas
 *   II - comprimento em planta das aberturas >= 40% do perimetro do pavimento
 */
export function calcularVentilacao(v: VentilacaoNatural): VentilacaoResultado {
  const areaAbertura = parseFloat(String(v.areaAbertura).replace(",", "."));
  const areaFachada = parseFloat(String(v.areaFachada).replace(",", "."));
  const comprimentoAbertura = parseFloat(String(v.comprimentoAbertura).replace(",", "."));
  const perimetroPavimento = parseFloat(String(v.perimetroPavimento).replace(",", "."));

  const pctArea = areaFachada > 0 && !Number.isNaN(areaAbertura) ? (areaAbertura / areaFachada) * 100 : null;
  const pctPerimetro =
    perimetroPavimento > 0 && !Number.isNaN(comprimentoAbertura) ? (comprimentoAbertura / perimetroPavimento) * 100 : null;

  const ok = Boolean(v.doisLados) && pctArea !== null && pctArea >= 20 && pctPerimetro !== null && pctPerimetro >= 40;

  return { pctArea, pctPerimetro, ok };
}

/** Alternativa do § 2º aos chuveiros automaticos, restrita a edificacoes preexistentes. */
function sprinklerAlternativaOk(s: SetorVistoria, preexistente: boolean | undefined): boolean {
  return Boolean(preexistente) && Boolean(s.hidChaveFluxo) && Boolean(s.hidDreno) && Boolean(s.hidManometro);
}

function sprinklerOk(s: SetorVistoria, preexistente: boolean | undefined): boolean {
  return Boolean(s.sprinklerIN15) || sprinklerAlternativaOk(s, preexistente);
}

function ocupacaoValida(ocupacao: SetorVistoria["ocupacao"]): ocupacao is OcupacaoArt6 {
  return Boolean(ocupacao) && (OCUPACOES_ART6 as readonly string[]).includes(ocupacao as string);
}

function toNumber(v: string | undefined): number | null {
  if (v === undefined || v === "") return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

export interface AvaliacaoSetor {
  dispensado: boolean;
  enquadramento: Enquadramento;
  resultado: string;
  ventilacao: VentilacaoResultado;
}

/**
 * Avalia um setor contra as hipoteses de dispensa do Art. 6º, incisos I a IV.
 * Retorna a primeira hipotese atendida (a ordem do artigo tambem e a ordem de
 * checagem) — nao ha "melhor" enquadramento, so o primeiro que se aplica.
 */
export function avaliarSetor(s: SetorVistoria, preexistente: boolean | undefined): AvaliacaoSetor {
  const ventilacao = calcularVentilacao(s.ventilacao);
  const areaTotal = toNumber(s.areaTotal);
  const areaPavimento = toNumber(s.areaPavimento);
  const ocupacaoOk = ocupacaoValida(s.ocupacao);

  // Inciso I — local externo/descoberto ou com cobertura leve.
  if (s.externo === true) {
    return { dispensado: true, enquadramento: "I", resultado: "DISPENSADO", ventilacao };
  }

  // Inciso II — deteccao automatica + (extracao mecanica OU ventilacao natural) + chuveiros automaticos.
  if (Boolean(s.deteccao) && (Boolean(s.extracao) || ventilacao.ok) && sprinklerOk(s, preexistente)) {
    return { dispensado: true, enquadramento: "II", resultado: "DISPENSADO", ventilacao };
  }

  // Inciso III — edificacao preexistente, ocupacao especifica, compartimentacao das rotas de fuga + deteccao.
  if (Boolean(preexistente) && ocupacaoOk && Boolean(s.compartRotas) && Boolean(s.deteccao)) {
    return { dispensado: true, enquadramento: "III", resultado: "DISPENSADO", ventilacao };
  }

  // Inciso IV — area total <= 1500 m2, ocupacao especifica, e (a) ou (b).
  if (ocupacaoOk && areaTotal !== null && areaTotal <= 1500) {
    // IV-a: ventilacao natural + deteccao automatica.
    if (ventilacao.ok && Boolean(s.deteccao)) {
      return { dispensado: true, enquadramento: "IV-a", resultado: "DISPENSADO", ventilacao };
    }
    // IV-b: pavimentos ate 500 m2, e ventilacao natural OU (compartimentacao das saidas + deteccao).
    if (areaPavimento !== null && areaPavimento <= 500) {
      if (ventilacao.ok || (Boolean(s.compartSaidas) && Boolean(s.deteccao))) {
        return { dispensado: true, enquadramento: "IV-b", resultado: "DISPENSADO", ventilacao };
      }
    }
  }

  const algumaRespostaDada =
    s.externo !== undefined ||
    s.deteccao !== undefined ||
    s.extracao !== undefined ||
    s.sprinklerIN15 !== undefined ||
    s.compartRotas !== undefined ||
    s.compartSaidas !== undefined ||
    ventilacao.pctArea !== null;

  return {
    dispensado: false,
    enquadramento: null,
    resultado: algumaRespostaDada ? "PBD EXIGIDO" : "Aguardando respostas",
    ventilacao,
  };
}

/**
 * Sugere, a partir dos criterios que falharam no setor, quais entram como candidatos
 * ao "Plano de Adequações" — o RT decide, para cada um, se e Sim/Não/Inviável
 * financeiramente viavel executar a alteracao. Preserva selecoes ja feitas (`existentes`).
 */
export function sugerirAlteracoes(s: SetorVistoria, ventilacao: VentilacaoResultado, existentes: Alteracao[] = []): Alteracao[] {
  const falhou: Record<string, boolean> = {
    deteccao: s.deteccao !== true,
    extracao: s.extracao !== true,
    ventilacao: !ventilacao.ok,
    sprinklerIN15: s.sprinklerIN15 !== true,
    compartRotas: s.compartRotas !== true,
    compartSaidas: s.compartSaidas !== true,
  };

  return CRITERIOS_ADEQUACAO.filter((c) => falhou[c.key]).map((c) => {
    const existente = existentes.find((a) => a.key === c.key);
    return { key: c.key, label: c.label, possivel: existente?.possivel };
  });
}
