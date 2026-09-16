import type { ClienteSnapshot } from "@/lib/clientes/types";
import type { ProfissionalSnapshot } from "@/lib/profissionais/types";

export type RespostaCNA = "C" | "NA" | "NC" | "";

export interface ItemRespostaIn12 {
  resposta: RespostaCNA;
  observacao?: string;
}

/** Estado do wizard do Relatório de Comissionamento do Sistema de Detecção e Alarme de Incêndio (IN 12 / NBR 17240). */
export interface AlarmeIn12State {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  // Cabeçalho da Edificação
  edificacao?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio_uf?: string;

  // Proprietário e Responsável pelo Uso
  proprietario_nome?: string;
  proprietario_email?: string;
  proprietario_fone?: string;
  responsavel_uso_nome?: string;
  responsavel_uso_email?: string;
  responsavel_uso_fone?: string;

  // Responsável Técnico
  rt_id?: string;
  rt?: ProfissionalSnapshot;
  rt_nome?: string;
  rt_registro?: string;
  rt_email?: string;
  rt_fone?: string;
  responsavel_tecnico_titulo?: string;
  comprovante_rt_numero?: string;

  // Especificações da Edificação
  ocupacao_destinacao?: string;
  altura_edificacao?: string;
  classificacao_uso?: string;
  idade_imovel?: string;
  endereco?: string;
  cidade?: string;
  cep?: string;
  contato_nome?: string;
  contato_fone?: string;

  // Checklist NBR 17240 (Chave = "8.1.1", "8.1.2", etc.)
  respostas?: Record<string, ItemRespostaIn12>;

  // Observações Gerais & Avaliação
  observacoes_gerais?: string;
  texto_atestado?: string;
  data_inspecao?: string;

  data_emissao?: string;
}
