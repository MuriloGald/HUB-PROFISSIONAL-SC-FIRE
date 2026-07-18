/**
 * Logica de classificacao de porte do evento baseada na IN 24 CBMSC.
 * Porte de js/utils/classificador.js do app legado Laudos_de_eventos_SCFire.
 */

export interface ClassificacaoInput {
  arLivreSemDelimitacao?: boolean;
  arLivreComDelimitacao?: boolean;
  publicoArLivre?: string | number;
  cobertoAberto?: boolean;
  publicoCobertoAberto?: string | number;
  cobertoFechado?: boolean;
  publicoCobertoFechado?: string | number;
}

export type Porte = "pequeno" | "medio" | "grande";

export function classificarEvento(respostas: ClassificacaoInput): Porte {
  let nivelPorte = 1; // 1 = Pequeno, 2 = Medio, 3 = Grande

  // O porte final do evento e definido pela situacao de MAIOR risco encontrada.

  // 1. Ar livre sem delimitacao (sempre Pequeno Porte se for apenas isso) - nivel ja e 1

  // 2. Ar livre com delimitacao
  if (respostas.arLivreComDelimitacao) {
    const pub = parseInt(String(respostas.publicoArLivre)) || 0;
    if (pub > 2500) nivelPorte = Math.max(nivelPorte, 3);
    else if (pub > 1000) nivelPorte = Math.max(nivelPorte, 2);
    else nivelPorte = Math.max(nivelPorte, 1);
  }

  // 3. Coberto e aberto nas laterais
  if (respostas.cobertoAberto) {
    const pub = parseInt(String(respostas.publicoCobertoAberto)) || 0;
    if (pub > 1250) nivelPorte = Math.max(nivelPorte, 3);
    else if (pub > 500) nivelPorte = Math.max(nivelPorte, 2);
    else nivelPorte = Math.max(nivelPorte, 1);
  }

  // 4. Coberto e fechado nas laterais
  if (respostas.cobertoFechado) {
    const pub = parseInt(String(respostas.publicoCobertoFechado)) || 0;
    if (pub > 500) nivelPorte = Math.max(nivelPorte, 3);
    else if (pub > 100) nivelPorte = Math.max(nivelPorte, 2);
    else nivelPorte = Math.max(nivelPorte, 1);
  }

  if (nivelPorte === 3) return "grande";
  if (nivelPorte === 2) return "medio";
  return "pequeno";
}
