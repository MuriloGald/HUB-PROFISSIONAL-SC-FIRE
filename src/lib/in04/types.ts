import type { ClienteSnapshot } from "@/lib/clientes/types";
import type { Imagem } from "@/components/features/shared/image-uploader";

export type RespostaChecklist3 = "sim" | "nao" | "na" | "";

export interface RespostaItem {
  resposta: RespostaChecklist3;
  /** Data do último teste/manutenção/reciclagem — só quando a pergunta exige acompanhamento. */
  dataAcompanhamento?: string;
  /** Nº do DRT/ART — só quando a pergunta exige acompanhamento do tipo "drt". */
  numeroDrt?: string;
}

export type CategoriaKey = "extintores" | "hidrantes" | "gas" | "saidas" | "iluminacao" | "alarme" | "eletrica" | "brigada";

/** Uma instância concreta lançada num pictograma (ex: "Extintor nº 12", "Corredor 3º andar"). */
export interface EquipamentoVistoriado {
  id: string;
  identificacao: string;
  /** Chave = Pergunta.chave da categoria. */
  respostas: Record<string, RespostaItem>;
  observacoes?: string;
  imagens: Imagem[];
}

export interface Pavimento {
  id: string;
  nome: string;
  itens: Record<CategoriaKey, EquipamentoVistoriado[]>;
}

export function novoPavimento(nome = "Térreo"): Pavimento {
  return {
    id: crypto.randomUUID(),
    nome,
    itens: { extintores: [], hidrantes: [], gas: [], saidas: [], iluminacao: [], alarme: [], eletrica: [], brigada: [] },
  };
}

export function novoEquipamento(): EquipamentoVistoriado {
  return { id: crypto.randomUUID(), identificacao: "", respostas: {}, imagens: [] };
}

/** Estado completo do wizard de Vistoria de Manutenção do SMSCI — também é o que fica salvo em laudos.dados. */
export interface VistoriaManutencaoState {
  /** 0 cliente · 1 identificação · 2 pavimentos (loop) · 3 revisão. */
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  vistoriador?: string;
  rt_nome?: string;
  rt_registro?: string;
  data_vistoria?: string;

  pavimentos: Pavimento[];
  pavimentoAtualId?: string;
  categoriaAtiva?: CategoriaKey;

  observacoesGerais?: string;
  imagensObservacoesGerais?: Imagem[];
  data_emissao?: string;
}
