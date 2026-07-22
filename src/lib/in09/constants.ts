export interface ChecklistItem {
  chave: string;
  texto: string;
}

export interface SecaoChecklist {
  numero: string;
  titulo: string;
  itens: ChecklistItem[];
}

/** Checklist fixo do Anexo E da IN 09/CBMSC — extraído ipsis literis do modelo oficial. */
export const SECOES_ELEVADOR: SecaoChecklist[] = [
  {
    numero: "1",
    titulo: "ELEVADOR DE EMERGÊNCIA (GERAL)",
    itens: [
      { chave: "1.1", texto: "A(s) porta(s) do(s) elevador(es) de emergência abre(m) dentro de antecâmara, varanda, balcão ou terraço (com ventilação para o exterior) ou hall pressurizado?" },
      { chave: "1.2", texto: "O(s) elevador(es) de emergência é(são) alimentado(s) por gerador de emergência?" },
      { chave: "1.3", texto: "Possui detecção automática de incêndio na casa de máquinas ou no maquinário do próprio elevador?" },
      { chave: "1.4", texto: "Possui intercomunicadores de duas vias no interior do elevador e na antecâmara que se comuniquem diretamente com intercomunicador instalado junto à central de alarme da edificação, todos obrigatoriamente instalados com placas de orientação de uso?" },
      { chave: "1.5", texto: "A central de alarme é do tipo analógica ou algorítmica?" },
      { chave: "1.6", texto: "Para edificações com mais de 100m de altura (exceto A-2), o interior da antecâmara do elevador possui câmeras para seu monitoramento e vídeo-monitor junto à central de alarme?" },
      { chave: "1.7", texto: "A central de alarme possui painel que indica o status de ocupação e a posição de cada elevador de emergência?" },
      { chave: "1.8", texto: 'Os elevadores de emergência entram automaticamente e imediatamente em modo de "evacuação total da edificação" em caso de incêndio?' },
    ],
  },
  {
    numero: "2",
    titulo: 'MODO "EVACUAÇÃO TOTAL"',
    itens: [
      { chave: "2.1", texto: "No primeiro momento, o elevador atende somente as chamadas oriundas da zona de incêndio, composta pelo pavimento sinistrado, pelos dois pavimentos imediatamente acima e pelos dois pavimentos imediatamente abaixo, conduzindo os ocupantes ao pavimento de descarga, ignorando outras chamadas?" },
      { chave: "2.2", texto: "O elevador, quando não possui chamadas em zonas de incêndio, atende os demais pavimentos do mais elevado para o menos elevado?" },
      { chave: "2.3", texto: "Para edificações com reduto resistente ao fogo: a prioridade é para os chamados do segmento entre o topo e o 1º RRF (do mais elevado para o menos elevado), depois para os chamados dos redutos, ou para os demais pavimentos?" },
      { chave: "2.4", texto: "Enquanto os passageiros estiverem entrando no elevador num andar em evacuação, se a carga exceder 100% da capacidade, as portas abrem e permanecem abertas, com notificação de voz e sinal visual de sobrecarga?" },
      { chave: "2.5", texto: 'Os elevadores possuem sinalização visual indicando o modo de "evacuação total" e sistema de notificação por voz que oriente os ocupantes?' },
    ],
  },
  {
    numero: "3",
    titulo: "PAINÉIS DE MENSAGENS (somente para edificações com mais de 150 m de altura)",
    itens: [
      { chave: "3.1", texto: "Possui painéis de mensagens variáveis com notificação por voz dentro das antecâmaras dos elevadores, em todos os pavimentos, entre 2,1 m e 3 m de altura, alimentados por fonte de emergência com autonomia de 3 horas?" },
      { chave: "3.2.1", texto: "Em todos os pavimentos em procedimento de evacuação, é indicado que os elevadores estão disponíveis e o tempo estimado para o próximo elevador chegar?" },
      { chave: "3.2.2", texto: "Nos pavimentos que não estejam em procedimento de evacuação é indicado que o serviço de elevador não está disponível?" },
      { chave: "3.2.3", texto: "No pavimento de descarga dos elevadores, há indicação de que os carros estão em modo de evacuação e que os passageiros não devem usar elevadores?" },
      { chave: "3.2.4", texto: "Se não houver elevadores disponíveis (operação por bombeiros, inspeção, desligamento), há indicação de que o serviço de elevador não está disponível?" },
    ],
  },
  {
    numero: "4",
    titulo: "CONTROLES DURANTE EMERGÊNCIA",
    itens: [
      { chave: "4.1", texto: "O controle do(s) elevador(es) de emergência é(são) baseado(s) em duas fases — Reversão de emergência (fase 1) e Operação de emergência (fase 2)?" },
      { chave: "4.2.1", texto: "Caso seja detectada fumaça no poço ou na sala de máquinas, o elevador retorna ao pavimento de descarga (ou alternativo), permanecendo com as portas abertas até decisão do bombeiro?" },
      { chave: "4.2.2", texto: "Possui, junto a cada elevador no pavimento de descarga, painel de comando individual com comutador de três posições (RESET/OFF/ON), operado por chave, removível só nas posições OFF e ON?" },
      { chave: "4.2.3", texto: "Para cancelar a Fase 1, o comutador deve ser colocado na posição RESET e em seguida na posição OFF?" },
      { chave: "4.2.4", texto: 'Junto ao painel de comando no pavimento de descarga: possui placa "OPERAÇÃO POR BOMBEIROS" e sinalizador luminoso das condições 4.2.1/4.2.2?' },
      { chave: "4.2.5", texto: "Possui sinalizador luminoso (formato de capacete de bombeiro ou símbolo intuitivo) que indique as condições 4.2.1/4.2.2, permanecendo ativo até o retorno à operação automática?" },
      { chave: "4.2.6", texto: 'A ativação da Fase 1 interrompe o modo de "evacuação total da edificação"?' },
      { chave: "4.3.1", texto: "Em qualquer momento, se o comutador OFF/HOLD/ON for colocado na posição OFF, as portas fecham e o elevador retorna ao piso de descarga, permanecendo com as portas abertas até nova decisão?" },
      { chave: "4.3.2", texto: "A opção HOLD do comutador OFF/HOLD/ON garante que o elevador permaneça num pavimento, com as portas totalmente abertas, desabilitando abrir/fechar e chamadas internas?" },
    ],
  },
  {
    numero: "5",
    titulo: "PAINEL DE COMANDO INTERNO",
    itens: [
      { chave: "5.1", texto: "Está protegido por tampa com fechadura, cuja chave é a mesma do comutador OFF/HOLD/ON?" },
      { chave: "5.2", texto: "Está instalado com todos os dispositivos e a fechadura em altura entre 1,22 m e 1,83 m?" },
      { chave: "5.3", texto: "Está localizado na mesma face do elevador que o painel de seleção de chamadas?" },
      { chave: "5.4", texto: 'Possui, na parte externa da tampa, identificação "OPERAÇÃO POR BOMBEIROS" em letras vermelhas?' },
      { chave: "5.5", texto: "Possui em seu interior sinalizador luminoso adicional com as mesmas características do item 4.2.4?" },
      { chave: "5.6", texto: "Possui, na parte interna, placa com breves orientações sobre o uso de cada botão/comutador e o significado das sinalizações visuais?" },
      { chave: "5.7.1", texto: "O comutador (com chave) de três posições OFF/HOLD/ON, na posição ON, libera o elevador para a equipe de emergência (só se já ativada a Fase 1), indisponível às chamadas externas?" },
      { chave: "5.7.2", texto: 'Possui botão de "abrir porta" de pressão contínua (permanece pressionado até abertura completa, senão fecha automaticamente)?' },
      { chave: "5.7.3", texto: 'Possui botão de "fechar porta" de pressão contínua (permanece pressionado até fechamento completo, senão abre automaticamente)?' },
      { chave: "5.7.4", texto: "Possui botão de cancelamento de chamadas internas, que faz o elevador parar com as portas fechadas no próximo pavimento disponível?" },
      { chave: "5.7.5", texto: "Possui comutador (sem chave) de duas posições RUN/STOP que, na posição STOP, cancela chamadas internas e corta a alimentação do motor até novo comando?" },
    ],
  },
];
