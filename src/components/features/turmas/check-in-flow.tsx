"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Flame, Loader2, MapPin, TriangleAlert } from "lucide-react";
import { autoCadastrarAluno, buscarAlunoPorCpf, buscarTurmaPorToken, registrarPresenca } from "@/app/actions/turmas";

type Etapa = "carregando" | "invalido" | "cpf" | "cadastro" | "confirmando" | "sucesso" | "erro";

interface TurmaInfo {
  id: string;
  status: string;
  training: { name: string; total_hours: number } | null;
  cliente: { nome: string; razao_social: string | null } | null;
}

const inputClass =
  "w-full px-4 py-3 text-sm text-white bg-white/[0.05] border border-white/[0.1] rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-gray-600";

function formatarCpf(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function CheckInFlow({ token }: { token: string }) {
  const [etapa, setEtapa] = useState<Etapa>("carregando");
  const [turma, setTurma] = useState<TurmaInfo | null>(null);
  const [erro, setErro] = useState("");

  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!token) {
      setEtapa("invalido");
      return;
    }
    buscarTurmaPorToken(token).then((res) => {
      if ("error" in res && res.error) {
        setErro(res.error);
        setEtapa("invalido");
        return;
      }
      const t = res.data as unknown as TurmaInfo;
      if (t.status !== "em_andamento") {
        setErro(t.status === "agendada" ? "Esta aula ainda não começou. Aguarde o instrutor iniciar." : "Esta aula já foi encerrada.");
        setEtapa("invalido");
        return;
      }
      setTurma(t);
      setEtapa("cpf");
    });
  }, [token]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleBuscarCpf() {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      setErro("Informe um CPF válido.");
      return;
    }
    setErro("");
    const res = await buscarAlunoPorCpf(cpfLimpo);
    if (res.data) {
      await confirmarPresenca(res.data.id);
    } else {
      setEtapa("cadastro");
    }
  }

  async function handleCadastrarECheckin() {
    if (!nome.trim()) {
      setErro("Informe seu nome completo.");
      return;
    }
    setErro("");
    setEtapa("confirmando");
    const res = await autoCadastrarAluno({ cpf, fullName: nome, email, phone: telefone, clienteId: null });
    if (res.error) {
      setErro(res.error);
      setEtapa("cadastro");
      return;
    }
    await confirmarPresenca(res.data!.id);
  }

  async function confirmarPresenca(studentId: string) {
    setEtapa("confirmando");

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
      // localizacao negada/indisponivel — segue sem ela, check-in nao depende disso
    }

    const res = await registrarPresenca({ classId: turma!.id, studentId, latitude, longitude });
    if (res.error) {
      setErro(res.error);
      setEtapa("erro");
      return;
    }
    setEtapa("sucesso");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Flame className="w-6 h-6 text-red-500" />
        <span className="text-sm font-bold text-white tracking-wide">SC FIRE — Check-in</span>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        {etapa === "carregando" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            <p className="text-xs text-gray-400">Carregando...</p>
          </div>
        )}

        {etapa === "invalido" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <TriangleAlert className="w-10 h-10 text-amber-500" />
            <p className="text-sm text-gray-300">{erro || "QR Code inválido."}</p>
          </div>
        )}

        {(etapa === "cpf" || etapa === "cadastro" || etapa === "confirmando") && turma && (
          <div className="mb-5 pb-5 border-b border-white/[0.08]">
            <p className="text-xs text-gray-500">{turma.cliente?.razao_social || turma.cliente?.nome}</p>
            <h2 className="text-base font-bold text-white">{turma.training?.name}</h2>
          </div>
        )}

        {etapa === "cpf" && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Seu CPF</label>
              <input
                className={inputClass}
                value={cpf}
                onChange={(e) => setCpf(formatarCpf(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
            </div>
            {erro && <p className="text-xs text-red-400">{erro}</p>}
            <button
              onClick={handleBuscarCpf}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Confirmar Presença
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
            <button
              onClick={handleCadastrarECheckin}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Cadastrar e Confirmar Presença
            </button>
          </div>
        )}

        {etapa === "confirmando" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Registrando presença...
            </p>
          </div>
        )}

        {etapa === "sucesso" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Presença confirmada!</h3>
            <p className="text-xs text-gray-400">Pode guardar o celular e acompanhar a aula.</p>
          </div>
        )}

        {etapa === "erro" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <TriangleAlert className="w-10 h-10 text-red-500" />
            <p className="text-sm text-gray-300">{erro}</p>
          </div>
        )}
      </div>
    </div>
  );
}
