"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Play, Users, X } from "lucide-react";
import { iniciarTurma } from "@/app/actions/turmas";

interface SalaDeEsperaProps {
  classId: string;
  cursoNome: string;
  clienteNome: string | null;
  instrutorNome: string | null;
  totalAulas: number;
}

export function SalaDeEspera({ classId, cursoNome, clienteNome, instrutorNome, totalAulas }: SalaDeEsperaProps) {
  const router = useRouter();
  const [iniciando, setIniciando] = useState(false);

  async function handleIniciar() {
    setIniciando(true);
    await iniciarTurma(classId);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-50">
      <Link href="/apresentacao" className="absolute top-6 right-6 p-2 rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </Link>

      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-foreground">{cursoNome}</h1>
          {clienteNome && <p className="text-sm text-muted-foreground">{clienteNome}</p>}
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          {instrutorNome && <span>{instrutorNome}</span>}
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> {totalAulas} aulas
          </span>
        </div>

        <button
          onClick={handleIniciar}
          disabled={iniciando}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50"
        >
          <Play className="w-4 h-4" /> {iniciando ? "Iniciando..." : "Iniciar Treinamento"}
        </button>
      </div>
    </div>
  );
}
