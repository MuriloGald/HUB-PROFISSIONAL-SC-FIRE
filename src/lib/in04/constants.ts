import { FireExtinguisher, Droplets, Flame, DoorOpen, Lightbulb, Siren, Zap, Users } from "lucide-react";
import type { CategoriaKey } from "./types";

export interface Pergunta {
  chave: string;
  texto: string;
  exigeAcompanhamento?: boolean;
  tipoAcompanhamento?: "drt" | "validade";
  /** 12/36/60 quando a periodicidade é fixa; omitido quando variável (ex: elétrica, 5/10/15/20 anos conforme risco). */
  periodicidadeMeses?: number;
}

export interface CategoriaChecklist {
  key: CategoriaKey;
  titulo: string;
  tituloSingular: string;
  normaRef: string;
  icon: React.ElementType;
  labelIdentificacao: string;
  perguntas: Pergunta[];
}

export const CATEGORIAS_IN04: CategoriaChecklist[] = [
  {
    key: "extintores",
    titulo: "Extintores",
    tituloSingular: "Extintor",
    normaRef: "IN 06",
    icon: FireExtinguisher,
    labelIdentificacao: "Nº / localização do extintor",
    perguntas: [
      { chave: "ext.1", texto: "Quantidade e localização conferem com o projeto (PPCI) aprovado." },
      { chave: "ext.2", texto: "Pressurizado, com lacre inviolado e sem sinais de corrosão ou deformação no cilindro." },
      { chave: "ext.3", texto: "Teste hidrostático e validade da carga em dia.", exigeAcompanhamento: true, tipoAcompanhamento: "validade" },
      { chave: "ext.4", texto: "Sem obstruções, sinalização de parede visível e em boas condições." },
      { chave: "ext.5", texto: "Sinalização de piso visível (garagens e depósitos)." },
    ],
  },
  {
    key: "hidrantes",
    titulo: "Hidrantes / SHP",
    tituloSingular: "Hidrante",
    normaRef: "IN 07",
    icon: Droplets,
    labelIdentificacao: "Ponto de hidrante / abrigo",
    perguntas: [
      { chave: "hid.1", texto: "Registro de alimentação abaixo da caixa d'água/RTI está aberto." },
      { chave: "hid.2", texto: "Mangueiras, esguichos, chaves storz e adaptadores completos no abrigo." },
      { chave: "hid.3", texto: "Hidrante de recalque no passeio acessível, limpo, com adaptador storz e tampão." },
      { chave: "hid.4", texto: "Teste anual de funcionamento da bomba e abertura de um hidrante.", exigeAcompanhamento: true, tipoAcompanhamento: "drt", periodicidadeMeses: 12 },
      { chave: "hid.5", texto: "DRT trienal de manutenção das bombas.", exigeAcompanhamento: true, tipoAcompanhamento: "drt", periodicidadeMeses: 36 },
      { chave: "hid.6", texto: "Laudo e DRT quinquenal de inspeção do reservatório e tubulações.", exigeAcompanhamento: true, tipoAcompanhamento: "drt", periodicidadeMeses: 60 },
    ],
  },
  {
    key: "gas",
    titulo: "Gás Combustível",
    tituloSingular: "Ponto de gás",
    normaRef: "IN 08",
    icon: Flame,
    labelIdentificacao: "Central / ponto de gás",
    perguntas: [
      { chave: "gas.1", texto: "Central livre de armazenamento indevido de materiais e em bom estado de conservação." },
      { chave: "gas.2", texto: "Pressão do manômetro da rede primária abaixo de 1,5 kgf/cm² e registro de corte funcional." },
      { chave: "gas.3", texto: "Laudo de estanqueidade da rede de gás quinquenal, assinado por RT com DRT.", exigeAcompanhamento: true, tipoAcompanhamento: "drt", periodicidadeMeses: 60 },
      { chave: "gas.4", texto: "Trecho de GLP a granel (ponto de reabastecimento → vasilhame) não passa pelo interior da edificação." },
      { chave: "gas.5", texto: "Abrigo de medidores íntegro, com validade dos componentes em dia." },
      { chave: "gas.6", texto: "Pontos de consumo (apartamentos): conexões, mangueiras e registro de fecho rápido dentro da validade e em condições de uso." },
      { chave: "gas.7", texto: "Aberturas de ventilação permanente dos ambientes com queima de gás desobstruídas." },
    ],
  },
  {
    key: "saidas",
    titulo: "Saídas de Emergência / Compartimentação",
    tituloSingular: "Porta / rota / dispositivo",
    normaRef: "IN 09 / IN 14",
    icon: DoorOpen,
    labelIdentificacao: "Porta / rota / dispositivo",
    perguntas: [
      { chave: "sai.1", texto: "Porta corta-fogo (PCF) fecha automaticamente e não está calçada aberta." },
      { chave: "sai.2", texto: "Portas com eletroímã liberam automaticamente caso o alarme dispare." },
      { chave: "sai.3", texto: "Rotas de fuga e antecâmaras 100% desobstruídas, sem depósito ou cabeamento estranho." },
      { chave: "sai.4", texto: "Manutenção anual de escadas pressurizadas/elevadores de emergência.", exigeAcompanhamento: true, tipoAcompanhamento: "drt", periodicidadeMeses: 12 },
      { chave: "sai.5", texto: "DRT anual de dispositivos automatizados de compartimentação (portas/cortinas corta-fogo).", exigeAcompanhamento: true, tipoAcompanhamento: "drt", periodicidadeMeses: 12 },
      { chave: "sai.6", texto: "Catracas liberam automaticamente na falta de energia ou disparo do alarme." },
      { chave: "sai.7", texto: "Fechaduras eletrônicas/magnéticas liberam via central de alarme e têm botoeira com bateria." },
      { chave: "sai.8", texto: "Fachadas totalmente envidraçadas / \"pele de vidro\": íntegros os elementos de fixação e de isolamento vertical." },
      { chave: "sai.9", texto: "Local de resgate aéreo (se houver) fechado, com chave em botoeira tipo quebra-vidro." },
      { chave: "sai.10", texto: "Elevador de emergência com chave para comando em casos de emergência disponível." },
      { chave: "sai.11", texto: "Dutos de escada desobstruídos, sem cabeamento ou tubulação predial (elétrica, gás, esgoto, dados) passando por eles." },
      { chave: "sai.12", texto: "Placas indicativas de pavimento e de lotação máxima fixadas e legíveis." },
      { chave: "sai.13", texto: "Controle de lotação de público automatizado funcionando (quando houver)." },
    ],
  },
  {
    key: "iluminacao",
    titulo: "Iluminação e Sinalização de Emergência",
    tituloSingular: "Ponto de luminária / sinal",
    normaRef: "IN 11 / IN 13",
    icon: Lightbulb,
    labelIdentificacao: "Ponto de luminária / sinalização",
    perguntas: [
      { chave: "ilu.1", texto: "Luminária de emergência acende automaticamente na simulação de queda de energia." },
      { chave: "ilu.2", texto: "Sinalização de saída iluminada ativa automaticamente na falta de energia." },
      { chave: "ilu.3", texto: "Sinalização fotoluminescente com brilho adequado (trocar se insuficiente mesmo dentro da validade).", exigeAcompanhamento: true, tipoAcompanhamento: "validade" },
    ],
  },
  {
    key: "alarme",
    titulo: "Alarme e Detecção de Incêndio",
    tituloSingular: "Central / acionador / detector",
    normaRef: "IN 12",
    icon: Siren,
    labelIdentificacao: "Central / acionador / detector",
    perguntas: [
      { chave: "ala.1", texto: "Painel da central sem luzes ou mensagens indicando falhas." },
      { chave: "ala.2", texto: "Teste prático anual do sistema.", exigeAcompanhamento: true, tipoAcompanhamento: "drt", periodicidadeMeses: 12 },
      { chave: "ala.3", texto: "DRT anual (sistemas com detecção automática ou automação integrada).", exigeAcompanhamento: true, tipoAcompanhamento: "drt", periodicidadeMeses: 12 },
      { chave: "ala.4", texto: "DRT trienal (sistemas só com botoeiras manuais).", exigeAcompanhamento: true, tipoAcompanhamento: "drt", periodicidadeMeses: 36 },
      { chave: "ala.5", texto: "Central retém histórico de eventos (5.000 endereçável Classe A/B, 10.000 algorítmica) e não apaga ao reiniciar." },
      { chave: "ala.6", texto: "Detectores de incêndio e acionadores manuais verificados e em funcionamento." },
    ],
  },
  {
    key: "eletrica",
    titulo: "Instalações Elétricas",
    tituloSingular: "Quadro / circuito / motor",
    normaRef: "IN 19",
    icon: Zap,
    labelIdentificacao: "Quadro / circuito / motor",
    perguntas: [
      { chave: "ele.1", texto: "Sistemas de emergência (bombas, extração de fumaça) fora do disjuntor geral da edificação." },
      { chave: "ele.2", texto: "Sem proteção por Disjuntor Diferencial Residual (DR) nos sistemas de emergência." },
      { chave: "ele.3", texto: "Cabos de alimentação resistentes ao fogo (TRRF do prédio, mínimo 30 minutos)." },
      { chave: "ele.4", texto: "Disjuntores dos motores sem proteção de sobrecarga (só curto-circuito)." },
      {
        chave: "ele.5",
        texto: "Manutenção preventiva da rede elétrica com DRT (periodicidade de 5, 10, 15 ou 20 anos conforme risco/ocupação).",
        exigeAcompanhamento: true,
        tipoAcompanhamento: "drt",
      },
      { chave: "ele.6", texto: "Quadros de distribuição com conexões apertadas e em bom estado de conservação (sem ferrugem/sujeira)." },
      { chave: "ele.7", texto: "Finalidade dos quadros e equipamentos identificada por placas/etiquetas." },
      { chave: "ele.8", texto: "Disjuntores dos quadros identificados, com correspondência clara aos respectivos circuitos." },
    ],
  },
  {
    key: "brigada",
    titulo: "Brigada e Plano de Emergência",
    tituloSingular: "Turno / equipe / documento",
    normaRef: "IN 28 / IN 31",
    icon: Users,
    labelIdentificacao: "Turno / equipe / documento",
    perguntas: [
      { chave: "bri.1", texto: "Número de brigadistas por turno confere com o Plano de Implantação." },
      { chave: "bri.2", texto: "Reciclagem da brigada válida (a cada 2 anos).", exigeAcompanhamento: true, tipoAcompanhamento: "validade", periodicidadeMeses: 24 },
      { chave: "bri.3", texto: "Plantas de risco e emergência fixadas nas paredes." },
      { chave: "bri.4", texto: "Ata do último simulado de abandono documentada (a cada 12 meses, guardada por 5 anos).", exigeAcompanhamento: true, tipoAcompanhamento: "validade", periodicidadeMeses: 12 },
      { chave: "bri.5", texto: "Equipamentos de proteção do PIBI disponibilizados aos brigadistas." },
      { chave: "bri.6", texto: "Capacitação para desfibrilador (DEA) e RCP em número suficiente, quando houver o equipamento." },
      { chave: "bri.7", texto: "Brigadista particular uniformizado/identificado e relação nominal atualizada disponível." },
      { chave: "bri.8", texto: "Cópia atualizada do PIBI e certificados de curso dos brigadistas voluntários na edificação." },
    ],
  },
];

export function categoriaPorKey(key: CategoriaKey): CategoriaChecklist {
  const categoria = CATEGORIAS_IN04.find((c) => c.key === key);
  if (!categoria) throw new Error(`Categoria desconhecida: ${key}`);
  return categoria;
}
