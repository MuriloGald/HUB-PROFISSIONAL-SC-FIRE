export interface ChecklistItem {
  chave: string;
  texto: string;
}

export interface SecaoChecklist {
  numero: string;
  titulo: string;
  itens: ChecklistItem[];
}

/** Checklist fixo do Anexo C da IN 07/CBMSC — extraído ipsis literis do modelo oficial. */
export const SECOES_SHP: SecaoChecklist[] = [
  {
    numero: "1",
    titulo: "HIDRANTES/MANGOTINHOS",
    itens: [
      { chave: "1.1", texto: "O sistema de hidrantes/mangotinhos atende ao leiaute da edificação conforme projeto técnico aprovado?" },
      { chave: "1.2", texto: "Todos os ambientes estão protegidos por hidrantes/mangotinhos?" },
      { chave: "1.3", texto: "Os hidrantes/mangotinhos estão instalados na posição correta, conforme projeto técnico aprovado?" },
      { chave: "1.4", texto: "Os hidrantes/mangotinhos estão desobstruídos e sinalizados conforme a IN 7?" },
      { chave: "1.5", texto: "Os hidrantes/mangotinhos estão sem vazamentos?" },
      { chave: "1.6", texto: "As mangueiras de incêndio estão em bom estado de conservação e possuem as demarcações de certificação?" },
      { chave: "1.7", texto: "Os abrigos estão de acordo com os parâmetros da IN 7?" },
      { chave: "1.8", texto: "Os abrigos possuem os equipamentos necessários (esguichos e chaves de mangueiras)?" },
    ],
  },
  {
    numero: "2",
    titulo: "CONJUNTO BOMBA DE INCÊNDIO (Bomba+Motor+Painel de controle e partida)",
    itens: [
      { chave: "2.1", texto: "A bomba de incêndio está adequadamente instalada?" },
      { chave: "2.2", texto: 'Existe bomba "jóquey" instalada? Caso positivo, a mesma está adequadamente instalada?' },
      { chave: "2.3", texto: "A bomba de incêndio está em compartimento protegido contra o fogo?" },
      { chave: "2.4", texto: "A bomba de incêndio está em compartimento sem acúmulo de materiais combustíveis?" },
      { chave: "2.5", texto: "A bomba de incêndio está sem vazamentos? (teste)" },
      { chave: "2.6", texto: "A bomba de incêndio está instalada com vazão e pressão de acordo com projeto técnico aprovado?" },
      { chave: "2.7", texto: "Os manômetros e pressostatos estão em boas condições e funcionando corretamente?" },
      { chave: "2.8", texto: "As válvulas de bloqueio (exceto no cabeçote de testes, se houver) estão travadas e na posição correta?" },
      { chave: "2.9", texto: "A fixação da bomba de incêndio está adequada?" },
      { chave: "2.10", texto: "Painel de sinalização corretamente instalado e em local com vigilância ou próximo à central de alarme?" },
    ],
  },
  {
    numero: "3",
    titulo: "TUBULAÇÃO",
    itens: [
      { chave: "3.1", texto: "Tubulação sem danos mecânicos?" },
      { chave: "3.2", texto: "Tubulação sem vazamentos? (teste)" },
      { chave: "3.3", texto: "Tubulação sem corrosão ou obstrução interna?" },
      { chave: "3.4", texto: "Tubulação adequadamente alinhada?" },
      { chave: "3.5", texto: "Tubulação aparente pintada na cor vermelha?" },
      { chave: "3.6", texto: "Suportes e braçadeiras adequados?" },
    ],
  },
  {
    numero: "4",
    titulo: "CONEXÃO DE RECALQUE",
    itens: [
      { chave: "4.1", texto: "Conexão de recalque está sinalizada?" },
      { chave: "4.2", texto: "Conexão de recalque está desobstruída?" },
      { chave: "4.3", texto: "Conexão de recalque está sem vazamentos?" },
    ],
  },
  {
    numero: "5",
    titulo: "TANQUES E RESERVATÓRIOS",
    itens: [
      { chave: "5.1", texto: "Reservatório de incêndio possui volume adequado de acordo como projeto técnico aprovado?" },
      { chave: "5.2", texto: "Reservatório de incêndio possui válvulas completamente abertas?" },
      { chave: "5.3", texto: "Reservatório de incêndio possui tubulação e válvulas adequadas?" },
      { chave: "5.4", texto: "O reservatório está em compartimento protegido contra o fogo?" },
    ],
  },
  {
    numero: "6",
    titulo: "TESTE DE FUNCIONAMENTO DO SHP",
    itens: [{ chave: "6.1", texto: "A partida das motobombas ocorre de maneira automática, obedecendo aos demais parâmetros exigidos?" }],
  },
];
