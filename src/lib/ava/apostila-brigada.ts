export interface PaginaApostila {
  arquivo: string;
}

export interface CapituloApostila {
  titulo: string;
  /** Índice (0-based) da primeira página deste capítulo dentro de PAGINAS_APOSTILA_BRIGADA. */
  paginaInicial: number;
}

/**
 * Apostila "Brigada de Incêndio [WNA]" — páginas exportadas como imagem
 * (Ambiente Virtual de Aprendizagem/Brigada de Incêndio [WNA]/*.png),
 * copiadas para public/apostilas/brigada-incendio/. Ordem e capítulos
 * conforme o Sumário do próprio material (Aspectos Legais p.04, Plano de
 * Emergência p.09, Combate Incêndio p.18, Primeiros Socorros p.40).
 */
const paginasNumeradas = Array.from({ length: 83 - 8 + 1 }, (_, i) => 8 + i);

export const PAGINAS_APOSTILA_BRIGADA: PaginaApostila[] = [
  { arquivo: "00-capa.png" },
  { arquivo: "01-sumario.png" },
  { arquivo: "02-aspectos-legais-a.png" },
  { arquivo: "03-aspectos-legais-b.png" },
  { arquivo: "04-aspectos-legais-c.png" },
  ...paginasNumeradas.map((n) => ({ arquivo: `pg-${String(n).padStart(2, "0")}.png` })),
];

function indiceDaPagina(numeroPagina: number): number {
  return PAGINAS_APOSTILA_BRIGADA.findIndex((p) => p.arquivo === `pg-${String(numeroPagina).padStart(2, "0")}.png`);
}

export const CAPITULOS_APOSTILA_BRIGADA: CapituloApostila[] = [
  { titulo: "Capa", paginaInicial: 0 },
  { titulo: "Aspectos Legais", paginaInicial: 2 },
  { titulo: "Plano de Emergência", paginaInicial: indiceDaPagina(9) },
  { titulo: "Combate a Incêndio", paginaInicial: indiceDaPagina(18) },
  { titulo: "Primeiros Socorros", paginaInicial: indiceDaPagina(40) },
];

export const APOSTILA_BASE_PATH = "/apostilas/brigada-incendio";
