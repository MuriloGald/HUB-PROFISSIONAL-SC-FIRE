export interface ChecklistItem {
  chave: string;
  texto: string;
}

export interface SecaoChecklist {
  numero: string;
  titulo: string;
  itens: ChecklistItem[];
}

/** Checklist fixo do Anexo C da IN 15/CBMSC — extraído ipsis literis do modelo oficial (NBR 10897). */
export const SECOES_CHUVEIROS: SecaoChecklist[] = [
  {
    numero: "1",
    titulo: "CHUVEIROS AUTOMÁTICOS",
    itens: [
      { chave: "1.1", texto: "O sistema de chuveiros automáticos está adaptado ao leiaute da edificação conforme projeto técnico aprovado?" },
      { chave: "1.2", texto: "Os compartimentos classificados como Risco Leve possuem chuveiros automáticos de resposta rápida?" },
      { chave: "1.3", texto: "Todos os compartimentos, exceto os isentos de acordo com a NBR 10.897 e IT 23, estão protegidos por chuveiros automáticos?" },
      { chave: "1.4", texto: "Os modelos dos chuveiros automáticos estão conforme o projeto aprovado?" },
      { chave: "1.5", texto: "Os chuveiros estão isentos de corpos estranhos (inclusive tinta) ou danos físicos, como indicado pelo catálogo do fabricante?" },
      { chave: "1.6", texto: "Os chuveiros estão instalados na posição correta, conforme projeto técnico aprovado (teto, prateleiras, etc.)?" },
      { chave: "1.7", texto: "A distância entre os chuveiros ou entre os chuveiros e as paredes está correta?" },
      { chave: "1.8", texto: "Os chuveiros estão desobstruídos em relação a obstruções junto ao teto (vigas, treliças, terças, dutos e afins)?" },
      { chave: "1.9", texto: "Os chuveiros próximos ao teto estão desobstruídos em relação a luminárias, dutos, eletrocalhas, passarelas, ventiladores e afins?" },
      { chave: "1.10", texto: "Os chuveiros estão desobstruídos em relação a elementos verticais de meia altura (biombos, divisórias baixas e afins)?" },
      { chave: "1.11", texto: "Os chuveiros estão desobstruídos em relação aos pilares?" },
      { chave: "1.12", texto: "Os chuveiros estão a uma distância adequada do forro ou teto?" },
      { chave: "1.13", texto: "Em áreas de armazenagem, a distância entre os chuveiros e o topo do material armazenado é adequada?" },
      { chave: "1.14", texto: "Os chuveiros estão sem corrosão?" },
      { chave: "1.15", texto: "Há chuveiros sobressalentes e chave especial para retirada e instalação?" },
      { chave: "1.16", texto: "Os produtos utilizados na instalação estão de acordo com o regulamentado pelo CBMSC?" },
      { chave: "1.17", texto: "Os chuveiros de resposta rápida fabricados há mais de 20 anos e/ou os de resposta padrão fabricados há mais de 50 anos foram ensaiados?" },
    ],
  },
  {
    numero: "2",
    titulo: "VÁLVULA DE GOVERNO E ALARME (VGA)",
    itens: [
      { chave: "2.1", texto: "As válvulas estão corretamente identificadas, conforme item 10.2 da NBR 10.897?" },
      { chave: "2.2", texto: "As válvulas de bloqueio estão travadas com correntes e/ou cadeados na posição completamente abertas?" },
      { chave: "2.3", texto: "As válvulas de bloqueio são do tipo indicadora e com fechamento lento?" },
      { chave: "2.4", texto: "As válvulas estão livres de danos mecânicos? (teste)" },
      { chave: "2.5", texto: "As válvulas estão acessíveis?" },
      { chave: "2.6", texto: "As válvulas estão isentas de vazamento? (teste)" },
      { chave: "2.7", texto: "As válvulas estão isentas de corrosão?" },
      { chave: "2.8", texto: "Há um fluxostato ligado à central de alarme? (teste)" },
      { chave: "2.9", texto: "A fiação do fluxostato está protegida?" },
      { chave: "2.10", texto: "O gongo hidráulico (quando instalado) funciona corretamente? (teste)" },
      { chave: "2.11", texto: "Existe conexão de teste de alarme para cada Válvula de Governo e funciona corretamente?" },
      { chave: "2.12", texto: "A central de alarme reconhece o sinal da conexão de teste e alarme em no máximo 90 segundos?" },
      { chave: "2.13", texto: "Os manômetros estão instalados e em boas condições?" },
    ],
  },
  {
    numero: "3",
    titulo: "CONEXÕES SETORIAIS DE DRENO, ENSAIO E ALARME (CS)",
    itens: [
      { chave: "3.1", texto: "As conexões setoriais estão adequadamente instaladas?" },
      { chave: "3.2", texto: "As conexões setoriais estão sinalizadas?" },
      { chave: "3.3", texto: "Há um fluxostato ligado à central de alarme? (teste)" },
      { chave: "3.4", texto: "A central de alarme reconhece o sinal da conexão de teste e alarme em no máximo 90 segundos?" },
      { chave: "3.5", texto: "A fiação do fluxostato está protegida?" },
      { chave: "3.6", texto: "As válvulas estão acessíveis?" },
      { chave: "3.7", texto: "As válvulas de bloqueio estão travadas com correntes e/ou cadeados na posição completamente abertas?" },
      { chave: "3.8", texto: "As válvulas de bloqueio são do tipo indicadora e com fechamento lento?" },
    ],
  },
  {
    numero: "4",
    titulo: "CONJUNTO BOMBA DE INCÊNDIO (Bomba + Motor + Painel de controle e partida)",
    itens: [
      { chave: "4.1", texto: "A bomba de incêndio está adequadamente instalada?" },
      { chave: "4.2", texto: "Foi apresentada curva de desempenho (vazão x pressão) da bomba preparada pelo fabricante antes da instalação?" },
      { chave: "4.3", texto: "Foi apresentada curva de desempenho (vazão x pressão) da bomba produzida nos últimos 36 meses?" },
      { chave: "4.4", texto: "A bomba de incêndio está em compartimento protegido contra o fogo?" },
      { chave: "4.5", texto: "A bomba de incêndio está em compartimento sem acúmulo de materiais combustíveis?" },
      { chave: "4.6", texto: "A bomba de incêndio não apresenta vazamentos? (teste)" },
      { chave: "4.7", texto: "A bomba de incêndio está instalada com vazão e pressão de acordo com projeto técnico aprovado?" },
      { chave: "4.8", texto: "As válvulas de bloqueio (exceto no cabeçote de testes, se houver) estão travadas na posição completamente aberta?" },
      { chave: "4.9", texto: "A fixação da bomba de incêndio está adequada?" },
      { chave: "4.10", texto: "Existe medidor de vazão para realização do teste anual?" },
      { chave: "4.11", texto: "Existe cabeçote de teste para realização do teste anual?" },
      { chave: "4.12", texto: "O painel da central de alarme acusa todos os eventos previstos no Anexo B da NBR 10897 para supervisão das bombas?" },
    ],
  },
  {
    numero: "5",
    titulo: "TUBULAÇÃO",
    itens: [
      { chave: "5.1", texto: "Tubulação sem danos mecânicos?" },
      { chave: "5.2", texto: "Tubulação sem vazamentos? (teste)" },
      { chave: "5.3", texto: "Tubulação sem corrosão ou obstrução interna?" },
      { chave: "5.4", texto: "Tubulação adequadamente alinhada?" },
      { chave: "5.5", texto: "Tubulação pintada e identificada?" },
      { chave: "5.6", texto: "Suportes e braçadeiras adequados?" },
    ],
  },
  {
    numero: "6",
    titulo: "CONEXÃO DE RECALQUE",
    itens: [
      { chave: "6.1", texto: "Conexão de recalque está sinalizada?" },
      { chave: "6.2", texto: "Conexão de recalque está desobstruída?" },
      { chave: "6.3", texto: "Conexão de recalque está isenta de vazamentos?" },
    ],
  },
  {
    numero: "7",
    titulo: "TANQUES E RESERVATÓRIOS",
    itens: [
      { chave: "7.1", texto: "O reservatório de incêndio possui volume adequado de acordo com o projeto técnico aprovado?" },
      { chave: "7.2", texto: "O reservatório de incêndio possui válvulas completamente abertas?" },
      { chave: "7.3", texto: "O reservatório de incêndio possui tubulação e válvulas adequadas?" },
      { chave: "7.4", texto: "Existe indicador de nível instalado no tanque?" },
    ],
  },
];

export const OPCOES_RISCO = ["Leve", "Ordinário I", "Ordinário II", "Extraordinário I", "Extraordinário II"];
export const OPCOES_ARMAZENAMENTO = ["Classe I", "Classe II", "Classe III", "Classe IV", "Plásticos"];
export const OPCOES_SISTEMA = ["Molhado", "Seco", "Pré-Ação", "Dilúvio"];
