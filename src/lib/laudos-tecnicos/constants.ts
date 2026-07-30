/**
 * Dados fixos dos Laudos Técnicos decorrentes da Inspeção de Regularidade (IN 04):
 * Alarme (nível de pressão sonora), Iluminação de Emergência (luxímetro) e
 * Estanqueidade da Rede de Gás — modelados a partir de laudos reais emitidos
 * por terceiros ("Laudos das inspeções/"), portados para a identidade visual
 * SC Fire e para o mesmo padrão de wizard/PDF do restante do hub.
 * Reaproveita a lista de RTs já definida no módulo de Eventos (IN 24) — mesma
 * equipe técnica da SC Fire, sem duplicar cadastro.
 */
export { RESPONSAVEIS_TECNICOS } from "@/lib/laudos/constants";
export type { ResponsavelTecnico } from "@/lib/laudos/constants";

import type { LaudoTecnicoTipo } from "./types";

export interface LaudoTecnicoConfig {
  titulo: string;
  subtitulo: string;
  apresentacao: string;
  objetivo: (descricaoImovel: string) => string;
  referencias: string;
  instrumentoDefault: string;
  labelSistema: string;
  colunasResultado: string[];
  conclusaoAprovado: string;
  conclusaoReprovado: (qtd: number) => string;
}

export const LAUDOS_TECNICOS_CONFIG: Record<LaudoTecnicoTipo, LaudoTecnicoConfig> = {
  alarme: {
    titulo: "LAUDO TÉCNICO DO TESTE DE FUNCIONAMENTO DO NÍVEL DE PRESSÃO SONORA PARA O SISTEMA DE ALARME E DETECÇÃO DE INCÊNDIO",
    subtitulo: "Sistema de Alarme e Detecção de Incêndio — IN 12/CBMSC",
    apresentacao:
      "Apresentamos o laudo técnico do teste de funcionamento do nível de pressão sonora para o sistema de alarme e detecção de incêndio, com a finalidade de conferir se os sistemas e dispositivos de segurança permanecem em condições normais de funcionamento e em conformidade com as previsões do projeto e/ou relatório de regularização aprovados perante o Corpo de Bombeiros Militar de Santa Catarina.",
    objetivo: (descricaoImovel) =>
      `O presente laudo tem como objetivo medir e testar o funcionamento do nível de pressão sonora para o sistema de alarme de incêndio instalado em ${descricaoImovel}.`,
    referencias:
      "Como referência para elaboração deste laudo técnico, utilizou-se do projeto preventivo, das normas ABNT NBR 17240:2010 — Sistemas de detecção e alarme de incêndio — projeto, instalação, comissionamento e manutenção de sistemas de detecção e alarme de incêndio — Requisitos, bem como a Instrução Normativa nº 12 — Sistema de detecção e alarme de incêndio, do Centro de Atividades Técnicas do CBMSC.",
    instrumentoDefault: "Decibelímetro digital",
    labelSistema: "sistema de alarme e detecção de incêndio",
    colunasResultado: ["Localização", "Nível de ruído local dB(A)", "Nível de ruído em alarme dB(A)", "Pressão sonora mínima de 15 dB(A) acima do nível de ruído local"],
    conclusaoAprovado:
      "O sistema de alarme e detecção de incêndio encontra-se em perfeito funcionamento, atendendo plenamente aos níveis de pressão sonora exigidos pelas normas vigentes e pelo Corpo de Bombeiros Militar de Santa Catarina.",
    conclusaoReprovado: (qtd) =>
      `Foram identificados ${qtd} ponto(s) de medição em desacordo com a pressão sonora mínima exigida (15 dB(A) acima do nível de ruído local), relacionados na tabela de resultados. Recomenda-se a adoção das medidas corretivas necessárias para a regularização do sistema.`,
  },
  iluminacao: {
    titulo: "LAUDO TÉCNICO DE ILUMINAÇÃO DE EMERGÊNCIA E DE SINALIZAÇÃO PARA ABANDONO DE LOCAL",
    subtitulo: "Iluminação de Emergência e Sinalização para Abandono de Local — IN 11 e IN 13/CBMSC",
    apresentacao:
      "Apresentamos o laudo técnico do teste do nível de iluminação de emergência e de funcionamento da sinalização para abandono de local, com a finalidade de conferir se os sistemas e dispositivos de segurança permanecem em condições normais de funcionamento e em conformidade com as previsões do projeto e/ou relatório de regularização aprovados perante o Corpo de Bombeiros Militar de Santa Catarina.",
    objetivo: (descricaoImovel) =>
      `O presente laudo tem como objetivo medir e testar o nível de iluminação de emergência e o funcionamento da sinalização para abandono de local instalado em ${descricaoImovel}.`,
    referencias:
      "Como referência para elaboração deste laudo técnico, utilizou-se das normas ABNT NBR 10898:2023 — Sistema de iluminação de emergência, bem como a Instrução Normativa nº 11 — Sistema de iluminação de emergência e a Instrução Normativa nº 13 — Sinalização para abandono de local, do CBMSC.",
    instrumentoDefault: "Luxímetro digital",
    labelSistema: "sistema de iluminação de emergência e da sinalização para abandono de local",
    colunasResultado: ["Pavimento", "Medição em locais planos — mín. 3 lux", "Medição em locais com desnível — mín. 5 lux"],
    conclusaoAprovado:
      "O sistema de iluminação de emergência e da sinalização para abandono de local encontra-se em perfeito funcionamento, atendendo aos níveis de iluminamento exigidos em normas.",
    conclusaoReprovado: (qtd) =>
      `Foram identificados ${qtd} pavimento(s) com nível de iluminamento abaixo do mínimo exigido, relacionados na tabela de resultados. Recomenda-se a adoção das medidas corretivas necessárias para a regularização do sistema.`,
  },
  gas: {
    titulo: "LAUDO TÉCNICO DE ESTANQUEIDADE DA REDE DE GÁS",
    subtitulo: "Estanqueidade da Rede de Gás Combustível — IN 08/CBMSC",
    apresentacao:
      "Apresentamos o laudo técnico referente ao teste de estanqueidade da rede do sistema de gás, realizado com a finalidade primordial de detectar possíveis vazamentos e assegurar a plena funcionalidade do sistema, em conformidade com as exigências de segurança e com as especificações de projeto.",
    objetivo: (descricaoImovel) =>
      `O presente teste foi realizado na rede do sistema de gás combustível instalada em ${descricaoImovel}, com o objetivo de verificar a integridade da instalação, detectar a ausência de vazamentos e assegurar a correta funcionalidade do sistema e de seus respectivos dispositivos de segurança.`,
    referencias: "Como referência para elaboração deste laudo técnico, utilizou-se a Instrução Normativa nº 08 — Instalações de Gás Combustível (IGC), do CBMSC.",
    instrumentoDefault: "Manômetro",
    labelSistema: "sistema de gás combustível",
    colunasResultado: ["Rede testada", "Estanque", "Data"],
    conclusaoAprovado: "A rede de gás combustível testada não apresentou vazamentos, encontrando-se estanque e em conformidade com as exigências normativas do CBMSC.",
    conclusaoReprovado: (qtd) =>
      `Foram identificadas ${qtd} rede(s) sem estanqueidade confirmada, relacionadas na tabela de resultados. Recomenda-se a adoção das medidas corretivas necessárias para a regularização do sistema antes da liberação de uso.`,
  },
};

export const LAUDOS_TECNICOS_LABELS: Record<LaudoTecnicoTipo, string> = {
  alarme: "Alarme de Incêndio",
  iluminacao: "Iluminação de Emergência",
  gas: "Estanqueidade da Rede de Gás",
};
