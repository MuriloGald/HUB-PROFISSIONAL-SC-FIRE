export interface RequisitoIn12 {
  item: string;
  titulo: string;
  descricao: string;
  padraoResposta?: "C" | "NA";
}

export const REQUISITOS_IN12: RequisitoIn12[] = [
  {
    item: "8.1.1",
    titulo: "Documentação Técnica",
    descricao:
      "Verificação da documentação técnica do sistema (manuais, desenhos de instalação, diagrama de interligação etc., conforme conteúdo do projeto executivo, atualizados de acordo com a montagem final).",
    padraoResposta: "C",
  },
  {
    item: "8.1.2",
    titulo: "Detector Térmico e Termovelocimétrico",
    descricao:
      "O detector térmico e termovelocimétrico foi ensaiado através do uso de gerador de ar quente, que produza, próximo ao detector, uma temperatura 10% superior à nominal do detector, devendo este operar em no máximo 90s.",
    padraoResposta: "NA",
  },
  {
    item: "8.1.3",
    titulo: "Detector de Fumaça",
    descricao:
      "O detector de fumaça foi ensaiado utilizando-se de um dispositivo de acionamento adequado ou injetando-se o gás de ensaio apropriado dentro da câmara de detectores pontuais de fumaça. Na impossibilidade de execução dos ensaios com o equipamento de injeção de gás, foram realizados produzindo-se fumaça através da combustão de materiais semelhantes aos existentes no ambiente protegido.",
    padraoResposta: "C",
  },
  {
    item: "8.1.4",
    titulo: "Acionadores Manuais",
    descricao:
      "Os acionadores manuais foram ativados adequadamente, e garantiu a ativação da central em no máximo 15 s, indicando corretamente o local ou a linha em alarme.",
    padraoResposta: "C",
  },
  {
    item: "8.1.5",
    titulo: "Circuitos Elétricos",
    descricao:
      "Para os circuitos elétricos foram executados ensaios de circuito aberto, fuga a terra e curto-circuito, em pontos aleatórios de cada um dos circuitos de detecção.",
    padraoResposta: "C",
  },
  {
    item: "8.1.6",
    titulo: "Avisadores e Indicadores",
    descricao:
      "Para o avisador e indicador foram executados dois ensaios em cada dispositivo, sendo um de atuação e outro de audibilidade e visibilidade.",
    padraoResposta: "C",
  },
  {
    item: "8.1.7",
    titulo: "Ensaio da Central",
    descricao:
      "O ensaio da central verificou o funcionamento de cada uma das funções desta e dos circuitos de detecção, alarme e comandos a ela interligados.",
    padraoResposta: "C",
  },
  {
    item: "8.1.8",
    titulo: "Tempo de Resposta de Sinalização",
    descricao:
      "O tempo de resposta de sinalização no ensaio de atuação foi efetuado fazendo-se entrar em condição de alarme um detector ou acionador manual correspondente ao circuito do comando em ensaio, atuando dentro de 30 s.",
    padraoResposta: "C",
  },
  {
    item: "8.1.9",
    titulo: "Painel Repetidor e/ou Sinóptico",
    descricao:
      "O painel repetidor e/ou sinóptico foi ensaiado em conjunto com a central, sendo verificadas todas as sinalizações previstas no projeto executivo.",
    padraoResposta: "C",
  },
  {
    item: "8.1.10",
    titulo: "Montagem e Posicionamento dos Detectores",
    descricao:
      "Os sistemas com detectores estão todos firmemente montados e corretamente posicionados conforme o projeto; verificou-se a existência ou não de objetos que poderiam bloquear a visão dos detectores e confirmada a sua previsão em projeto; verificou-se a ligação, alimentação e configuração dos detectores e respectivo sistema de controle e alarme.",
    padraoResposta: "C",
  },
  {
    item: "8.1.11",
    titulo: "Termo de Garantia e Certificados",
    descricao:
      "Após conclusão do comissionamento foram emitidos certificados de entrega de obra e aceitação do sistema com termo de garantia. Os documentos foram assinados pelo instalador e pelo cliente ou seu representante.",
    padraoResposta: "C",
  },
];

export const TEXTO_ATESTADO_PADRAO =
  "Atesto, nesta data, que o sistema de detecção e alarme de incêndio da edificação foi inspecionado e verificadas as condições de funcionamento e sinalização de 100% dos equipamentos, conforme as prescrições da NBR 17240 e IN 12, e encontra-se em conformidade, estando o proprietário e/ou responsável pelo uso ciente das responsabilidades de manutenção e utilização adequada do sistema.";
