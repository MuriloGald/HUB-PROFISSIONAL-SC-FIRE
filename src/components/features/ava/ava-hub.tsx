"use client";

import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, ClipboardList, Flame, Loader2, MapPin, MessageSquareText, TriangleAlert } from "lucide-react";
import { autoCadastrarAluno, buscarAlunoPorCpf, registrarPresenca } from "@/app/actions/turmas";
import { buscarTurmaParaAva } from "@/app/actions/ava";
import { ApostilaViewer } from "./apostila-viewer";
import { AvaliacaoPanel } from "./avaliacao-panel";
import { PesquisaPanel } from "./pesquisa-panel";
import type { TurmaAva } from "@/lib/ava/types";

type Etapa = "carregando" | "invalido" | "cpf" | "cadastro" | "identificando" | "hub";
type View = "apostila" | "presenca" | "avaliacao" | "pesquisa";

const inputClass =
  "w-full px-4 py-3 text-sm text-white bg-white/[0.05] border border-white/[0.1] rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-gray-600";

function formatarCpf(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function chaveAluno(token: string): string {
  return `scfire_ava_aluno_${token}`;
}

interface AlunoIdentificado {
  id: string;
  nome: string;
}

export function AvaHub({ token }: { token: string }) {
  const [etapa, setEtapa] = useState<Etapa>("carregando");
  const [turma, setTurma] = useState<TurmaAva | null>(null);
  const [erro, setErro] = useState("");
  const [view, setView] = useState<View>("apostila");
  const [aluno, setAluno] = useState<AlunoIdentificado | null>(null);

  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const [presencaStatus, setPresencaStatus] = useState<"idle" | "enviando" | "sucesso" | "erro">("idle");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!token) {
      setEtapa("invalido");
      return;
    }
    buscarTurmaParaAva(token).then((res) => {
      if ("error" in res && res.error) {
        setErro(res.error);
        setEtapa("invalido");
        return;
      }
      const t = res.data as TurmaAva;
      if (t.status !== "em_andamento") {
        setErro(t.status === "agendada" ? "Esta aula ainda não começou. Aguarde o instrutor iniciar." : "Esta aula já foi encerrada.");
        setEtapa("invalido");
        return;
      }
      setTurma(t);

      const salvo = window.localStorage.getItem(chaveAluno(token));
      if (salvo) {
        try {
          setAluno(JSON.parse(salvo));
          setEtapa("hub");
          return;
        } catch {
          // ignora e segue pro fluxo de identificacao
        }
      }
      setEtapa("cpf");
    });
  }, [token]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function identificar(id: string, nomeAluno: string) {
    const info = { id, nome: nomeAluno };
    window.localStorage.setItem(chaveAluno(token), JSON.stringify(info));
    setAluno(info);
    setEtapa("hub");
  }

  async function handleBuscarCpf() {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      setErro("Informe um CPF válido.");
      return;
    }
    setErro("");
    const res = await buscarAlunoPorCpf(cpfLimpo);
    if (res.data) {
      identificar(res.data.id, res.data.full_name);
    } else {
      setEtapa("cadastro");
    }
  }

  async function handleCadastrar() {
    if (!nome.trim()) {
      setErro("Informe seu nome completo.");
      return;
    }
    setErro("");
    setEtapa("identificando");
    const res = await autoCadastrarAluno({ cpf, fullName: nome, email, phone: telefone, clienteId: null });
    if (res.error) {
      setErro(res.error);
      setEtapa("cadastro");
      return;
    }
    identificar(res.data!.id, res.data!.full_name);
  }

  async function marcarPresenca() {
    if (!turma || !aluno) return;
    setPresencaStatus("enviando");

    let latitude: number | null = null;
    let longitude: number | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("no geolocation"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch {
      // localizacao negada/indisponivel — nao bloqueia o check-in
    }

    const res = await registrarPresenca({ classId: turma.id, studentId: aluno.id, latitude, longitude });
    setPresencaStatus(res.error ? "erro" : "sucesso");
  }

  if (etapa === "carregando") {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
        <p className="text-xs text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (etapa === "invalido") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
        <TriangleAlert className="w-10 h-10 text-amber-500" />
        <p className="text-sm text-gray-300">{erro || "QR Code inválido."}</p>
      </div>
    );
  }

  if (etapa === "cpf" || etapa === "cadastro" || etapa === "identificando") {
    return (
      <div className="w-full max-w-sm mx-auto py-10 px-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Flame className="w-6 h-6 text-red-500" />
          <span className="text-sm font-bold text-white tracking-wide">Ambiente Virtual de Aprendizagem</span>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <div className="mb-5 pb-5 border-b border-white/[0.08]">
            <p className="text-xs text-gray-500">{turma?.clienteNome}</p>
            <h2 className="text-base font-bold text-white">{turma?.trainingName}</h2>
          </div>

          {etapa === "cpf" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">Informe seu CPF para acessar o ambiente do curso:</p>
              <input className={inputClass} value={cpf} onChange={(e) => setCpf(formatarCpf(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
              {erro && <p className="text-xs text-red-400">{erro}</p>}
              <button onClick={handleBuscarCpf} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors">
                Entrar
              </button>
            </div>
          )}

          {etapa === "cadastro" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 mb-2">Primeira vez aqui — complete seu cadastro:</p>
              <input className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
              <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail (opcional)" />
              <input className={inputClass} value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone (opcional)" />
              {erro && <p className="text-xs text-red-400">{erro}</p>}
              <button onClick={handleCadastrar} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors">
                Cadastrar e Entrar
              </button>
            </div>
          )}

          {etapa === "identificando" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
              <p className="text-xs text-gray-400">Entrando...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // etapa === "hub"
  const menu: { id: View; label: string; icon: typeof BookOpen }[] = [
    { id: "apostila", label: "Conteúdo", icon: BookOpen },
    { id: "presenca", label: "Presença", icon: MapPin },
    { id: "avaliacao", label: "Avaliação", icon: ClipboardList },
    { id: "pesquisa", label: "Pesquisa", icon: MessageSquareText },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-dvh px-4 py-4">
      <header className="flex items-center justify-between gap-3 pb-3 flex-shrink-0">
        <div className="min-w-0">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider truncate">{turma?.clienteNome}</p>
          <h1 className="text-sm font-bold text-white truncate">{turma?.trainingName}</h1>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{aluno?.nome.split(" ")[0]}</span>
      </header>

      <div className="flex gap-2 pb-3 flex-shrink-0">
        {menu.map((m) => (
          <button
            key={m.id}
            onClick={() => setView(m.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-semibold transition-all ${
              view === m.id ? "bg-red-500/10 border-red-500 text-white" : "border-white/[0.08] text-gray-400 hover:bg-white/[0.03]"
            }`}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {view === "apostila" && <ApostilaViewer />}

        {view === "presenca" && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 flex flex-col items-center gap-3 text-center">
            {presencaStatus === "idle" && (
              <>
                <MapPin className="w-10 h-10 text-red-500" />
                <p className="text-sm text-gray-300">Toque no botão abaixo para confirmar sua presença nesta aula.</p>
                <button onClick={marcarPresenca} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors">
                  Marcar Presença
                </button>
              </>
            )}
            {presencaStatus === "enviando" && (
              <>
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                <p className="text-xs text-gray-400">Registrando presença...</p>
              </>
            )}
            {presencaStatus === "sucesso" && (
              <>
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Presença confirmada!</h3>
              </>
            )}
            {presencaStatus === "erro" && (
              <>
                <TriangleAlert className="w-10 h-10 text-red-500" />
                <p className="text-sm text-gray-300">Não consegui registrar sua presença. Tente novamente.</p>
                <button onClick={marcarPresenca} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors">
                  Tentar novamente
                </button>
              </>
            )}
          </div>
        )}

        {view === "avaliacao" && turma && aluno && <AvaliacaoPanel classId={turma.id} studentId={aluno.id} trainingId={turma.trainingId} />}

        {view === "pesquisa" && turma && aluno && <PesquisaPanel classId={turma.id} studentId={aluno.id} />}
      </div>
    </div>
  );
}
