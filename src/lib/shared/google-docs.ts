"use client";

/**
 * Exportação para Google Docs pelo navegador: o usuário autoriza com a própria
 * conta Google (Google Identity Services, escopo drive.file — o app só enxerga
 * os arquivos que ele mesmo criou) e o .docx é enviado ao Drive com
 * mimeType de Google Doc, o que faz o Drive convertê-lo em documento nativo.
 *
 * Requer NEXT_PUBLIC_GOOGLE_CLIENT_ID (OAuth Client ID do tipo "Aplicativo da
 * Web" no Google Cloud, com a origem do site em "Origens JavaScript
 * autorizadas" e a Google Drive API ativada). Sem ele, googleDocsConfigurado()
 * retorna false e a UI cai no download do .docx.
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const SCOPE = "https://www.googleapis.com/auth/drive.file";
const GIS_SRC = "https://accounts.google.com/gsi/client";

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface TokenClient {
  callback: (resp: TokenResponse) => void;
  error_callback?: (err: { type: string; message?: string }) => void;
  requestAccessToken: (overrides?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: TokenResponse) => void;
            error_callback?: (err: { type: string; message?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

let gisPromise: Promise<void> | null = null;
let tokenClient: TokenClient | null = null;
let tokenCache: { token: string; expiraEm: number } | null = null;

export function googleDocsConfigurado(): boolean {
  return CLIENT_ID.length > 0;
}

/** Carrega o script do Google Identity Services. Chame cedo (no mount) para que o popup de login abra ainda dentro do clique do usuário. */
export function precarregarGoogle(): Promise<void> {
  if (!googleDocsConfigurado()) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const s = document.createElement("script");
    s.src = GIS_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gisPromise = null;
      reject(new Error("Não foi possível carregar o login do Google."));
    };
    document.head.appendChild(s);
  });
  return gisPromise;
}

/**
 * Obtém um access token do Drive. Precisa ser chamada de dentro de um clique
 * (antes de qualquer await longo), senão o navegador bloqueia o popup do Google.
 */
export function obterTokenGoogle(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiraEm) return Promise.resolve(tokenCache.token);
  if (!window.google?.accounts?.oauth2) return Promise.reject(new Error("Login do Google ainda carregando — tente de novo em instantes."));

  return new Promise<string>((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = window.google!.accounts.oauth2.initTokenClient({ client_id: CLIENT_ID, scope: SCOPE, callback: () => {} });
    }
    tokenClient.callback = (resp) => {
      if (resp.error || !resp.access_token) {
        reject(new Error(resp.error_description || resp.error || "Autorização do Google negada."));
        return;
      }
      // Margem de 60s pra não usar um token prestes a expirar.
      tokenCache = { token: resp.access_token, expiraEm: Date.now() + ((resp.expires_in ?? 3600) - 60) * 1000 };
      resolve(resp.access_token);
    };
    tokenClient.error_callback = (err) => {
      reject(new Error(err.type === "popup_closed" ? "Login do Google cancelado." : err.message || "Falha no login do Google."));
    };
    tokenClient.requestAccessToken();
  });
}

/** Envia um .docx ao Drive convertendo para Google Doc. Devolve o link de edição. */
export async function enviarDocxComoGoogleDoc(token: string, docx: Blob, nome: string): Promise<string> {
  const metadata = { name: nome.replace(/\.docx$/i, ""), mimeType: "application/vnd.google-apps.document" };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", new Blob([docx], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }));

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (res.status === 401) tokenCache = null;
  if (!res.ok) {
    const detalhe = await res.text().catch(() => "");
    throw new Error(`Google Drive recusou o envio (${res.status}). ${detalhe.slice(0, 200)}`);
  }
  const json = (await res.json()) as { id: string; webViewLink?: string };
  return json.webViewLink || `https://docs.google.com/document/d/${json.id}/edit`;
}
