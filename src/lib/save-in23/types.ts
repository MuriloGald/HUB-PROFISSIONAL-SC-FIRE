import type { Enquadramento } from "./classificador";
import type { ClienteSnapshot } from "@/lib/clientes/types";
import type { ProfissionalSnapshot } from "@/lib/profissionais/types";

export interface Imagem {
  url: string;
  legenda?: string;
}

/**
 * Medidas de ventilacao natural (Art. 6º, § 1º da IN 23) — capturadas como valores
 * brutos para o classificador calcular os percentuais, em vez de um Sim/Não manual
 * como no app legado.
 */
export interface VentilacaoNatural {
  doisLados?: boolean;
  areaAbertura?: string;
  areaFachada?: string;
  comprimentoAbertura?: string;
  perimetroPavimento?: string;
}

export type Possibilidade = boolean | "financeiro";

export interface Alteracao {
  key: string;
  label: string;
  possivel?: Possibilidade;
}

export const OCUPACOES_ART6 = ["A-1", "A-2", "C-1", "C-2", "D", "H-4"] as const;
export type OcupacaoArt6 = (typeof OCUPACOES_ART6)[number];

export interface SetorVistoria {
  id: string;
  nome: string;
  vagas?: string;
  ocupacao?: OcupacaoArt6 | "";
  areaTotal?: string;
  areaPavimento?: string;
  externo?: boolean;
  deteccao?: boolean;
  extracao?: boolean;
  ventilacao: VentilacaoNatural;
  sprinklerIN15?: boolean;
  hidChaveFluxo?: boolean;
  hidDreno?: boolean;
  hidManometro?: boolean;
  compartRotas?: boolean;
  compartSaidas?: boolean;
  compartEntreSave?: boolean;
  alteracoes: Alteracao[];
  altObs?: string;
  observacoes?: string;
  imagens: Imagem[];
}

/** Estado completo do wizard de Vistoria de Campo — tambem e o que fica salvo em laudos.dados */
export interface VistoriaWizardState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  vistoriador_id?: string;
  vistoriador_profissional?: ProfissionalSnapshot;
  rt_id?: string;
  rt?: ProfissionalSnapshot;
  /** @deprecated nomes digitados a mao — so aparecem em vistorias salvas antes do Vistoriador/RT virarem Profissionais cadastrados. */
  vistoriador?: string;
  respTecnico?: string;

  setores: SetorVistoria[];
  observacoesGerais?: string;

  data_emissao?: string;
}

export interface HistoricoItem {
  id: string;
  tituloData: string;
  descricao: string;
}

export interface ClausulaLaudo {
  id: string;
  titulo: string;
  texto: string;
  incluir: boolean;
}

export interface Subsecao {
  id: string;
  titulo: string;
  corpo: string;
  imagens: Imagem[];
}

export interface Cenario {
  id: string;
  titulo: string;
  fundamentacao?: string;
  /** Parágrafo de abertura do cenário (ex.: "Este cenário baseia-se no Artigo 6º..."), antes das subseções numeradas. */
  introducao?: string;
  subsecoes: Subsecao[];
}

/** Estado completo do wizard de Laudo Tecnico — tambem e o que fica salvo em laudos.dados */
export interface LaudoTecnicoWizardState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  tituloDocumento?: string;
  subtitulo?: string;
  propriedade?: string;
  revisao?: string;
  rt_id?: string;
  rt?: ProfissionalSnapshot;
  /** @deprecated nome digitado a mao — so aparece em laudos salvos antes do RT virar um Profissional cadastrado. */
  respTecnico?: string;

  capitulo1: {
    areaConstruida?: string;
    pavimentos?: string;
    altura?: string;
    validadeAtestado?: string;
    textoIntro?: string;
    historico: HistoricoItem[];
    notaObservacao?: string;
  };
  capitulo2: {
    clausulas: ClausulaLaudo[];
  };
  capitulo3: {
    cenarios: Cenario[];
  };
  capitulo4: {
    texto?: string;
  };

  data_emissao?: string;
}

export type { Enquadramento };
