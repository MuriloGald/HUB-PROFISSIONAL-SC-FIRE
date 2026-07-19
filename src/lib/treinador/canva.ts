/**
 * Link de compartilhamento do Canva (".../view?utm_content=...") não é o mesmo link
 * pra incorporar em iframe — o Canva exige ".../view?embed" (sem os parâmetros de
 * utm/tracking) pra abrir em modo apresentação sem a barra de ferramentas do editor.
 */
export function limparUrlCanvaParaEmbed(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("canva.com") && u.pathname.endsWith("/view")) {
      u.search = "embed";
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}
