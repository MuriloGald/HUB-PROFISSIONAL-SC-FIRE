export interface ChecklistItem {
  chave: string;
  texto: string;
}

/** Documentação a ser deixada no local — só se aplica ao Anexo B (Comissionamento). */
export const DOCS_DEIXADOS: ChecklistItem[] = [
  { chave: "doc1", texto: "Memorial descritivo e especificações técnicas dos principais equipamentos e materiais" },
  { chave: "doc2", texto: "Cálculo das aberturas de extração natural e/ou vazão da extração mecânica da fumaça" },
  { chave: "doc3", texto: "Folha de dados dos equipamentos e/ou extratores" },
  { chave: "doc4", texto: "Tabela de marca, modelo, potência elétrica e vazão dos equipamentos" },
  { chave: "doc5", texto: "Execução de diagrama de ar" },
  { chave: "doc6", texto: "Desenho do sistema (plantas e principais cortes da rede de dutos)" },
  { chave: "doc7", texto: "Desenhos das casas de máquinas de ventilação (planta e principais cortes)" },
  { chave: "doc8", texto: "Informações e diagrama elétrico dos sistemas" },
];

/** Integridade dos componentes — só se aplica ao Anexo C (Inspeção). */
export const INTEGRIDADE_COMPONENTES: ChecklistItem[] = [
  { chave: "int1", texto: "Todos os componentes do sistema de detecção de fumaça encontram-se operacionais?" },
  { chave: "int2", texto: "O sistema de alarme encontra-se operacional?" },
  { chave: "int3", texto: "O sistema de gerenciamento de energia encontra-se operacional e em bom estado?" },
  { chave: "int4", texto: "O sistema de controle de temperatura encontra-se operacional e em bom estado?" },
  { chave: "int5", texto: "Fonte de energia reserva (gerador) revisado, operacional e em bom estado?" },
  { chave: "int6", texto: "Operação automática de portas e fechamentos operacional?" },
];

/** Memorial de ensaios — compartilhado pelos Anexos B e C (mesmo checklist técnico). */
export const ENSAIOS_FUMACA: ChecklistItem[] = [
  { chave: "e1", texto: "Extrator mecânico (ventilador e motor) em funcionamento com fonte de energia primária (rede) e com fonte de energia reserva (grupo gerador)?" },
  { chave: "e2", texto: "Manobra automática de energia primária para a reserva (grupo motogerador)?" },
  { chave: "e3", texto: "Funcionamento correto da reversão do ventilador principal para o reserva?" },
  { chave: "e4", texto: "A qualidade da energia elétrica fornecida está adequada (tensão e corrente elétrica, frequência e aterramento)?" },
  { chave: "e5", texto: "O tempo de ativação do sistema de controle de fumaça corresponde ao tempo de projeto?" },
  { chave: "e6", texto: "Há equilíbrio de fases do sistema elétrico?" },
  { chave: "e7", texto: "Fiação e ligações elétricas corretamente executados?" },
  { chave: "e8", texto: "Quadros elétricos com componentes devidamente identificados e presentes?" },
  { chave: "e9", texto: "Funcionamento correto do extrator natural com respectivos atuadores?" },
  { chave: "e10", texto: "Registros corta-fogo e/ou fumaça presentes e operantes?" },
  { chave: "e11", texto: "Registros de entrada de ar presente e operante?" },
  { chave: "e12", texto: "Registros de sobrepressão presente e operante?" },
  { chave: "e13", texto: "Venezianas e grelhas de ar presentes, desobstruídas e corretamente instaladas?" },
  { chave: "e14", texto: "Rede de dutos devidamente fixados, sem vazamentos e desobstruídos?" },
  { chave: "e15", texto: "Vazão de ar medida confere com a vazão de projeto?" },
  { chave: "e16", texto: "Taxa volumétrica das grelhas de extração de fumaça e instrução de ar confere com a de projeto?" },
  { chave: "e17", texto: "Direção do fluxo de ar de acordo com a necessidade e projeto?" },
  { chave: "e18", texto: "Quando constantes em projeto, o enclausuramento e abertura das portas estão de acordo com as especificações?" },
  { chave: "e19", texto: "Os diferenciais de pressão estão dentro da faixa de operação?" },
  { chave: "e20", texto: "O sistema de controle de temperatura está corretamente instalado e operacional?" },
  { chave: "e21", texto: "Variadores de frequência com sensores de pressão?" },
  { chave: "e22", texto: "Sistema de supervisão e controles presente e funcional?" },
  { chave: "e23", texto: "Sistema de detecção presente e devidamente instalado?" },
  { chave: "e24", texto: "Sistema de alarme de incêndio devidamente instalado e operacional com interligação com os detectores de fumaça e sistema de controle de fumaça?" },
  { chave: "e25", texto: "Interligação do sistema de controle de fumaça com os detectores de fumaça devidamente instalado e operacional?" },
  { chave: "e26", texto: "Instalação, apoios, fixação e sustentação de todos os componentes devidamente executados?" },
];
