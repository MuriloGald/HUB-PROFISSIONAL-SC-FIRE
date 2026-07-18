/**
 * Mensagem amigável para erros comuns no fluxo de geração de PDF (dynamic import).
 *
 * "Failed to load chunk ... from module ..." (ChunkLoadError) acontece quando o
 * navegador ainda tem a página aberta de antes de um novo deploy — o build atual
 * já não tem mais os arquivos JS com os hashes que a aba carregou. A correção é
 * só recarregar a página; sem isso, a mensagem técnica confunde o usuário.
 */
export function mensagemErroGeracao(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : String(err);
  const ehChunkLoadError =
    (err instanceof Error && err.name === "ChunkLoadError") || /Failed to load chunk/i.test(msg) || /Loading chunk .* failed/i.test(msg);

  if (ehChunkLoadError) {
    return "Uma nova versão do sistema foi publicada enquanto esta página estava aberta. Atualize a página (F5) e tente gerar novamente.";
  }

  return msg || fallback;
}
