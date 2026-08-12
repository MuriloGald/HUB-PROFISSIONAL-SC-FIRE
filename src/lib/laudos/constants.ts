/**
 * Dados fixos do modulo de Laudos de Eventos (IN 24 CBMSC).
 * Porte de js/data/constants.js do app legado Laudos_de_eventos_SCFire.
 */

export interface ResponsavelTecnico {
  nome: string;
  cpf: string;
  classe: string;
  nr_rt: string;
  email: string;
  telefone: string;
}

/**
 * @deprecated RTs agora sao cadastrados em src/app/actions/profissionais.ts —
 * este dict fica só como fallback pra reabrir/regerar documentos salvos antes
 * dessa mudança (que guardavam apenas a chave "rt1"/"rt2"). `classe`/`nr_rt`
 * já vêm com o prefixo CREA/CFT porque documentos antigos nunca tiveram esse
 * dado separado.
 */
export const RESPONSAVEIS_TECNICOS: Record<string, ResponsavelTecnico> = {
  rt1: {
    nome: "DIONE BORGES",
    cpf: "004.260.880-50",
    classe: "CREA/SC 177797-2",
    nr_rt: "CREA/SC 177797-2",
    email: "contato@scfire.com.br",
    telefone: "48 3093-6140",
  },
  rt2: {
    nome: "PAULO ROBERTO RAMOS",
    cpf: "070.256.320-49",
    classe: "CFT 70256632049",
    nr_rt: "CFT 70256632049",
    email: "contato@scfire.com.br",
    telefone: "48 3093-6140",
  },
};

export const EMPRESA = {
  endereco: "Rua Hermes Zapelini",
  numero: "513",
  cep: "88110-050",
  bairro: "Barreiros",
  cidade: "São José",
  complemento: "Sala 02",
  email: "contato@scfire.com.br",
  telefone: "48 3093-6140",
};

export const OPCOES_RESPOSTA = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
  { value: "na", label: "Não se aplica" },
];

export const PERGUNTAS_MAP: Record<string, string> = {
  // PEQUENO PORTE
  CGPP01: "O evento será realizado ao ar livre, sem delimitação de área?",
  CGPP02: "O evento será realizado ao ar livre, com delimitação de área e com limitação de público de até 1.000 pessoas?",
  CGPP03: "O evento será realizado em local ou estrutura coberto e aberto nas laterais, possuindo ou não delimitação de área por barreira física nas laterais, desde que estas não comprometam a ventilação, com previsão de público de até 500 pessoas?",
  CGPP04: "O evento será realizado em local ou estrutura coberto e fechado nas laterais, com previsão de público de até 100 pessoas?",
  GLPPP: "Será utilizado mais de 90 kg de GLP?",
  PROVISORIAPP01: "Serão utilizadas tendas ou blocos de tendas com mais de 100 m² cada, que não possuam isolamento de no mínimo 2 metros entre si?",
  PROVISORIAPP02: "Serão utilizadas arquibancadas provisórias?",
  PROVISORIAPP03: "Serão utilizadas estruturas provisórias como tablados, camarotes e estruturas congêneres destinadas ao público, essas com nível superior a 60 cm de altura do seu piso em relação ao solo?",
  PROVISORIAPP04: "Serão utilizados grandes brinquedos mecânicos denominados “atrações”, como os de parques temáticos ou de diversão?",
  TEM_PIRO: "Haverá espetáculo pirotécnico no evento?",

  // MÉDIO PORTE
  CGMP01: "O evento será realizado ao ar livre, sem delimitação de área, com a montagem de alguma estrutura (ou GLP) que exceda os limites permitidos para isenção ou eventos de pequeno porte?",
  CGMP02: "O evento será realizado ao ar livre, com delimitação de área e previsão de público de 1.001 até 2.500 pessoas?",
  CGMP03: "O evento será realizado em local ou estrutura coberto e aberto nas laterais, possuindo ou não delimitação de área por barreira física nas laterais, desde que estas não comprometam a ventilação, com previsão de público de 501 a 1.250 pessoas.",
  CGMP04: "O evento será realizado em local ou estrutura coberto e fechado nas laterais com previsão de público de 101 a 500 pessoas.",
  EPMP01: "Serão utilizadas tendas ou blocos de tendas, ambos com mais de 100 m² ou sem afastamento?",
  EPMP02: "Serão utilizadas arquibancadas provisórias?",
  EPMP03: "Serão utilizadas estruturas como tablados, camarotes e estruturas congêneres destinadas ao público, com nível superior a 60 cm de altura do seu piso em relação ao solo?",
  EPMP04: "Serão utilizados grandes brinquedos mecânicos denominados “atrações”, como os de parques temáticos ou de diversão?",
  EPMP05: "Serão utilizadas estruturas tais como pontes, passarelas e similares?",
  EPMP06: "Serão utilizadas estruturas metálicas?",
  EPMP07: "Serão utilizadas instalações elétricas, englobando iluminação, sonorização, gerador de emergência, dentre outros dispositivos energizados?",
  EPMP08: "Serão utilizadas estruturas relacionadas a esportes de aventura?",
  SMSCIMP01: "Haverá uso de GLP? Se sim, informe a quantidade: {{VAL}} kg",
  GAS: "Quantidade de GLP (kg)",
  SMSCIMP02: "A instalação de gás combustível atende aos requisitos da IN 8?",
  SMSCIMP03: "Os recipientes de GLP estarão posicionados em locais comprovadamente sem acesso ao público e protegidos das intempéries?",
  SMSCIMP04: "A proteção por extintores atende aos requisitos da IN 6?",
  SMSCIMP05: "As saídas de emergência atendem aos requisitos da IN 9?",
  SMSCIMP06: "O sistema de iluminação de emergência atende aos requisitos da IN 11?",
  SMSCIMP07: "O sistema de sinalização para abandono de local atende aos requisitos da IN 13?",
  SMSCIMP08: "Havendo a utilização de materiais de acabamento e revestimento, estes atendem aos requisitos da IN 18 - CMAR?",
  SMSCIMP09: "Havendo espetáculo pirotécnico, este atende aos requisitos da IN 27?",
  SMSCIMP10: "O grupo motogerador possui o devido isolamento e exaustão de gases da combustão?",
  SMSCIMP11: "O dimensionamento dos brigadistas atende aos requisitos da IN 28?",
  SMSCIMP12: "O acesso de viaturas foi previsto e atende os requisitos da IN 35?",
  SMSCIMP13: "Caso sejam necessários outros SMSCI, estes estão previstos e serão executados de acordo com as NSCI?",
  DEA: "Sendo o público previsto igual ou superior a 1.500 pessoas, foi previsto desfibrilador externo automático (DEA)?",
  DOCMP: "Os documentos previstos no artigo 34 da IN 24 foram emitidos e estão de acordo com as NSCI?",
  OBS: "Observações",

  // GRANDE PORTE
  CGGP01: "O evento será realizado ao ar livre com delimitação de área e previsão de público acima de 2.500 pessoas?",
  CGGP02: "O evento será realizado em local ou estrutura coberto e aberto nas laterais, possuindo ou não delimitação de área por barreira física nas laterais, desde que estas não comprometam a ventilação, com previsão de público acima de 1.250 pessoas?",
  CGGP03: "O evento será realizado em local ou estrutura coberto e fechado nas laterais com previsão de público acima de 500 pessoas?",
  PROVISORIAGP01: "Serão utilizadas tendas ou blocos de tendas, ambos com mais de 100 m² ou sem afastamento?",
  PROVISORIAGP02: "Serão utilizadas arquibancadas provisórias?",
  PROVISORIAGP03: "Serão utilizadas estruturas como tablados, camarotes e estruturas congêneres destinadas ao público, com nível superior a 60 cm de altura do seu piso em relação ao solo?",
  PROVISORIAGP04: "Serão utilizados grandes brinquedos mecânicos denominados “atrações”, como os de parques temáticos ou de diversão?",
  PROVISORIAGP05: "Serão utilizadas estruturas tais como pontes, passarelas e similares?",
  PROVISORIAGP06: "Serão utilizadas estruturas metálicas?",
  PROVISORIAGP07: "Serão utilizadas instalações elétricas, englobando iluminação, sonorização, gerador de emergência, dentre outros dispositivos energizados?",
  PROVISORIAGP08: "Serão utilizadas estruturas relacionadas a esportes de aventura?",
  GLPGP01: "Haverá uso de GLP? Se sim, informe a quantidade: {{VAL}} kg",
  GLPGP02: "A instalação de gás combustível atenderá aos requisitos da IN 8?",
  GLPGP03: "Os recipientes estarão posicionados em locais comprovadamente sem acesso ao público e protegidos das intempéries?",
  EXTGP1: "A proteção por extintores atende aos requisitos da IN 6?",
  EXTGP02_QTD: "Informe a quantidade de extintores portáteis previstos para o evento: {{VAL}} extintores",
  EXTGP03_QTD: "Informe a quantidade de extintores sobrerrodas previstos para o evento: {{VAL}} extintores",
  SEGP01: "As saídas de emergência atendem aos requisitos da IN 9?",
  AMBFEC: "Informe a quantidade de estruturas com delimitação de área e ambientes fechados que terão concentração de público no evento: {{VAL}} locais.",
  SEGP03: "Identifique no item 3 deste memorial, todas as estruturas com delimitação de área e ambientes fechados informadas no item anterior, informando as características do local, previsão de público, área, distância máxima a ser percorrida, quantidade e largura total das saídas de emergência para cada um deles.",
  SEGP04: "Existem, no mínimo, duas alternativas de saídas de emergência para cada ambiente com reunião de público que possibilitem diferentes sentidos de fuga?",
  SEGP05: "Foram atendidas as larguras mínimas das rotas de fuga horizontais (acessos) e verticais (escadas e rampas)?",
  SEGP06: "Para eventos que se assemelham a boates ou shows musicais, quando realizados em locais cobertos e fechados nas laterais, foram atendidas as larguras mínimas admitidas das portas conforme a IN 9?",
  SEGP07: "As portas de saída são do tipo “de abrir” e têm sentido de abertura igual ao do fluxo de saída?",
  SEGP08: "As portas que não abrem no sentido do fluxo de saída permanecerão abertas durante toda a realização do evento?",
  SEGP09: "Foram previstas barras antipânico nas portas de saída?",
  SEGP10: "Foi prevista área de dispersão?",
  SEGP11: "Será fixada placa próximo à entrada, com dimensões mínimas de 40 x 20 cm, indicando a lotação máxima autorizada para o local?",
  CONTROLE: "Foi previsto controle de lotação de público:",
  SEGP12: "Para controle de público automatizado, foi previsto monitor ou placar eletrônico exibindo a lotação existente no local?",
  SEGP13: "Para eventos em locais cobertos, as distâncias máximas a serem percorridas atendem à Tabela 9 do Anexo C da IN 9?",
  SEGP14: "Os parâmetros mínimos para as arquibancadas são atendidos conforme a IN 9?",
  SEGP15: "Foram atendidas as exigências da IN 9 para as rampas? Informe a inclinação máxima das rampas prevista para o evento: {{VAL}}%",
  SEGP16: "O evento conta com escadas de emergência conforme a IN 9? Se sim, seus critérios são atendidos?",
  SEGP17: "O local do evento possui passarelas? Se sim, atende aos requisitos da IN 9?",
  SIEGP01: "O Sistema de Iluminação de Emergência atende aos requisitos da IN 11?",
  SIEGP02: "Foram previstas luminárias de emergência em todos os locais com desníveis, mudanças de direção e intersecções de corredores na rota de fuga, etc?",
  SIEGP03: "A distância máxima entre dois pontos de SIE atende ao limite de quatro vezes a altura de instalação destes em relação ao piso?",
  LUM: "Informe a quantidade total de luminárias previstas para o evento: {{VAL}} luminárias.",
  SALGP01: "O Sistema de Sinalização para Abandono de Local atende aos requisitos da IN 13?",
  SALGP02: "Foram previstas placas de SAL para assinalar todas as mudanças de direção, saídas, obstáculos, etc, de tal forma que em cada ponto de SAL seja possível visualizar o ponto seguinte?",
  SALGP03: "Foram previstas placas indicativas de fluxo? Se sim, indique a quantidade: {{VAL}} placas",
  SALGP04: "As placas de SAL possuem as dimensões mínimas e distâncias de visualização que atendam o previsto na Tabela 1 - Anexo A da IN 13?",
  SALGP05: "Para eventos que se assemelham a boates ou shows musicais realizados em locais cobertos e fechados nas laterais, foram previstas placas luminosas que devem permanecer constantemente iluminadas durante todo o evento?",
  DEMAISGP01: "Serão utilizados materiais de acabamento e revestimento de acordo com a IN 18 - CMAR?",
  DEMAISGP02: "Havendo espetáculo pirotécnico, este atende aos requisitos da IN 27?",
  DEMAISGP03: "O grupo motogerador previsto possui o devido isolamento e exaustão de gases da combustão?",
  DEMAISGP04: "Os brigadistas previstos atendem aos requisitos da IN 28, com a emissão da respectiva DRT de dimensionamento? Informe a quantidade de brigadistas prevista para o evento: {{VAL}} brigadistas.",
  DEMAISGP05: "O acesso de viaturas foi previsto e atende aos requisitos da IN 35?",
  DEMAISGP06: "Caso sejam necessários outros SMSCI, de acordo com as Tabelas 1 e 2 da IN 24, estes foram previstos e atendem aos requisitos normativos?",
  DEMAISGP07: "O croqui apresentado contempla todas estruturas e o dimensionamento e localização de todos os SMSCI previstos para o evento, conforme as NSCI?",
  EQUIPSGP: "Sendo o público previsto igual ou superior a 1.500 pessoas, foi previsto desfibrilador externo automático (DEA)?",
  DOCGP: "Os documentos previstos no Artigo 34 da IN 24, referentes ao dimensionamento dos SMSCI e de eventuais estruturas previstas para o evento, foram emitidos e estão de acordo com as NSCI?",

  // ANEXO E - LAUDO DE COMISSIONAMENTO
  LADOC: "O Memorial Técnico de Segurança Contra Incêndio, DRT e croqui apresentados estão de acordo com o evento temporário?",
  LASE: "Todos os ambientes do evento possuem saídas de emergência em quantidade suficiente e dimensionadas para o público previsto para o local, de acordo com a tabela de dimensionamento das saídas de emergência, item 3 do Memorial Técnico de Segurança Contra Incêndio?",
  LASIE: "Foram instaladas luminárias de emergência em todos os locais com desníveis, mudanças de direção e intersecções de corredores na rota de fuga, etc? Estão todas funcionando?",
  LASAL: "Foram instaladas as placas de SAL conforme as dimensões e distâncias de visualização previstas no Memorial Técnico de Segurança Contra Incêndio?",
  LADE1: "Foram apresentados os laudos, junto com o DRT de execução/instalação, de todos os materiais de acabamento e revestimento de acordo com os requisitos da IN 18 - CMAR?",
  LADE2: "Os demais SMSCI necessários para o evento, de acordo com as Tabelas 1 e 2 da IN 24, foram instalados e estão em condições de uso de acordo com as NSCI?",
  LAPIRO1: "Os laudos e documentos previstos na IN 27 referentes a espetáculos pirotécnicos foram emitidos e estão de acordo com as NSCI?",
  LAPIRO2: "Para espetáculos pirotécnicos em ambientes abertos, foi atendido o diâmetro mínimo de segurança da área de queima, em conformidade com a Tabela 1 da IN 27?",
  LAPIRO3: "Para espetáculos pirotécnicos em ambientes abertos, foi atendido o afastamento mínimo de segurança entre a área de queima e os espectadores, em conformidade com a Tabela 2 da IN 27?",
  LAPIRO4: "Para espetáculos pirotécnicos em ambientes fechados, foram previstos fogos específicos para esse tipo de ambiente, em conformidade com o artigo 9º da IN 27?",
  LAPIRO5: "Para espetáculos pirotécnicos em ambientes fechados, foi atendido o afastamento mínimo de segurança, em conformidade com o artigo 26 da IN 27?",

  rt_selecionado: "Responsável Técnico (RT)",
};
