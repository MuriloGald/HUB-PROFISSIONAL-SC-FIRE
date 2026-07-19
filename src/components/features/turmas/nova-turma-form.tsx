"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarTurma } from "@/app/actions/turmas";
import type { Cliente } from "@/lib/supabase/types";

interface NovaTurmaFormProps {
  cursos: { id: string; name: string }[];
  clientes: Cliente[];
}

export function NovaTurmaForm({ cursos, clientes }: NovaTurmaFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const [trainingId, setTrainingId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [instrutorNome, setInstrutorNome] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!trainingId) {
      setErro("Selecione o curso.");
      return;
    }
    if (!clienteId) {
      setErro("Selecione o cliente.");
      return;
    }

    startTransition(async () => {
      const res = await criarTurma({ trainingId, clienteId, instrutorNome: instrutorNome.trim(), scheduledAt });

      if (res.error) {
        setErro(res.error);
        return;
      }

      router.push("/treinamentos/turmas");
      router.refresh();
    });
  }

  const inputClass =
    "w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-400 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
      <div>
        <label className={labelClass}>Curso</label>
        <select className={inputClass} value={trainingId} onChange={(e) => setTrainingId(e.target.value)}>
          <option value="">Selecione...</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Cliente</label>
        <select className={inputClass} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Selecione...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.razao_social || c.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Instrutor</label>
          <input className={inputClass} value={instrutorNome} onChange={(e) => setInstrutorNome(e.target.value)} placeholder="Nome do instrutor" />
        </div>
        <div>
          <label className={labelClass}>Data prevista</label>
          <input type="date" className={inputClass} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </div>
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {pending ? "Criando..." : "Criar Turma"}
      </button>
    </form>
  );
}
