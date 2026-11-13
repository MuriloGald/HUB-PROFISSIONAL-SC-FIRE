"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileBarChart2, FileDown, FileText, Loader2, Pencil } from "lucide-react";
import { buscarRelatorioTurma } from "@/app/actions/turmas";
import { googleDocsConfigurado, obterTokenGoogle, precarregarGoogle } from "@/lib/shared/google-docs";
import { RelatorioTurmaEditor } from "./relatorio-turma-editor";

type Acao = "pdf" | "gdocs" | "docx";

const BTN =
  "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.1] hover:border-red-500/50 hover:bg-white/[0.06] text-xs font-semibold text-gray-300 hover:text-red-400 transition-all disabled:opacity-50";

export function RelatorioTurmaButton({ classId }: { classId: string }) {
  const [carregando, setCarregando] = useState<Acao | null>(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [linkDoc, setLinkDoc] = useState("");
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    precarregarGoogle().catch(() => {});
  }, []);

  async function buscarDados() {
    const res = await buscarRelatorioTurma(classId);
    if ("error" in res) throw new Error(res.error);
    return res.data;
  }

  function iniciar(acao: Acao) {
    setErro("");
    setAviso("");
    setLinkDoc("");
    setCarregando(acao);
  }

  async function handlePdf() {
    iniciar("pdf");
    try {
      const data = await buscarDados();
      const { gerarPdfRelatorioTurma } = await import("@/lib/turmas/pdf-generator");
      await gerarPdfRelatorioTurma(data);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao gerar o PDF.");
    } finally {
      setCarregando(null);
    }
  }

  async function handleDocx() {
    iniciar("docx");
    try {
      const data = await buscarDados();
      const { baixarDocxRelatorioTurma } = await import("@/lib/turmas/docx-generator");
      await baixarDocxRelatorioTurma(data);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao gerar o .docx.");
    } finally {
      setCarregando(null);
    }
  }

  async function handleGoogleDocs() {
    // Sem Client ID configurado: entrega o .docx, que o Google Drive converte ao abrir.
    if (!googleDocsConfigurado()) {
      await handleDocx();
      setAviso("Integração com Google não configurada — baixei o .docx. No Google Drive: Novo › Upload de arquivo › abrir com Google Docs.");
      return;
    }

    iniciar("gdocs");
    // O pedido de token sai primeiro, ainda dentro do clique, para o popup do Google não ser bloqueado.
    const tokenPromise = obterTokenGoogle();
    try {
      const [data, { gerarDocxRelatorioTurma, nomeArquivoRelatorioTurma }, { enviarDocxComoGoogleDoc }] = await Promise.all([
        buscarDados(),
        import("@/lib/turmas/docx-generator"),
        import("@/lib/shared/google-docs"),
      ]);
      const blob = await gerarDocxRelatorioTurma(data);
      const token = await tokenPromise;
      const link = await enviarDocxComoGoogleDoc(token, blob, nomeArquivoRelatorioTurma(data, ".docx"));
      setLinkDoc(link);
      window.open(link, "_blank", "noopener");
    } catch (e) {
      tokenPromise.catch(() => {});
      setErro(e instanceof Error ? e.message : "Falha ao enviar para o Google Docs.");
    } finally {
      setCarregando(null);
    }
  }

  const ocupado = carregando !== null;
  const icone = (acao: Acao, Icon: typeof FileText) =>
    carregando === acao ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => {
            setErro("");
            setAviso("");
            setEditando(true);
          }}
          disabled={ocupado}
          className={BTN}
          title="Editar os dados do relatório antes de gerar"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </button>
        <button onClick={handlePdf} disabled={ocupado} className={BTN} title="Baixar o relatório em PDF">
          {icone("pdf", FileBarChart2)}
          {carregando === "pdf" ? "Gerando..." : "PDF"}
        </button>
        <button onClick={handleGoogleDocs} disabled={ocupado} className={BTN} title="Criar o relatório como Google Docs no seu Drive">
          {icone("gdocs", FileText)}
          {carregando === "gdocs" ? "Enviando..." : "Google Docs"}
        </button>
        <button onClick={handleDocx} disabled={ocupado} className={BTN} title="Baixar o relatório em Word (.docx)">
          {icone("docx", FileDown)}
          {carregando === "docx" ? "Gerando..." : ".docx"}
        </button>
      </div>
      {linkDoc && (
        <a href={linkDoc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline mt-1">
          <ExternalLink className="w-3 h-3" /> Abrir no Google Docs
        </a>
      )}
      {aviso && <p className="text-[10px] text-amber-400 mt-1 max-w-xs">{aviso}</p>}
      {erro && <p className="text-[10px] text-red-400 mt-1">{erro}</p>}
      {editando && (
        <RelatorioTurmaEditor
          classId={classId}
          onFechar={() => setEditando(false)}
          onSalvo={() => {
            setEditando(false);
            setAviso("Edição salva — os próximos PDF/.docx já saem com as alterações.");
          }}
        />
      )}
    </div>
  );
}
