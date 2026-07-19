"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, Clock, PanelLeftClose, PanelLeftOpen, CircleAlert } from "lucide-react";
import { limparUrlCanvaParaEmbed } from "@/lib/treinador/canva";
import type { AulaResumo, CursoTreinador } from "@/lib/treinador/types";

function formatarTempo(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  const par = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${par(m)}:${par(s)}` : `${par(m)}:${par(s)}`;
}

export function CockpitInstrutor({ curso, aulas }: { curso: CursoTreinador; aulas: AulaResumo[] }) {
  const [index, setIndex] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [sidebarAberta, setSidebarAberta] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === ".") setIndex((i) => Math.min(i + 1, aulas.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      if (e.key === "Escape") setSidebarAberta(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aulas.length]);

  const aula = aulas[index];
  const embedUrl = aula?.canvaEmbed ? limparUrlCanvaParaEmbed(aula.canvaEmbed) : null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.08] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarAberta((v) => !v)}
            className="p-1.5 rounded-md hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            {sidebarAberta ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">{curso.name}</p>
            <p className="text-sm font-semibold text-white truncate">{aula?.name ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-300 font-mono">
            <Clock className="w-3.5 h-3.5" /> {formatarTempo(segundos)}
          </span>
          <span className="text-xs text-gray-500">
            {index + 1} / {aulas.length}
          </span>
          <Link href={`/treinador/${curso.id}`} className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        {sidebarAberta && (
          <div className="w-72 flex-shrink-0 border-r border-white/[0.08] overflow-y-auto bg-white/[0.02]">
            {aulas.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setIndex(i)}
                className={`w-full text-left px-4 py-3 border-b border-white/[0.04] transition-colors ${
                  i === index ? "bg-red-500/10 border-l-2 border-l-red-500" : "hover:bg-white/[0.03] border-l-2 border-l-transparent"
                }`}
              >
                <p className={`text-sm font-medium truncate ${i === index ? "text-white" : "text-gray-400"}`}>{a.name}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  {a.category} · {a.hours}h {!a.canvaEmbed && "· sem Canva"}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Main viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            {embedUrl ? (
              <iframe
                key={aula.id}
                src={embedUrl}
                allow="fullscreen"
                allowFullScreen
                className="w-full h-full rounded-lg border border-white/[0.08]"
                title={aula.name}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <CircleAlert className="w-8 h-8" />
                <p className="text-sm">Este subtema ainda não tem link do Canva cadastrado.</p>
                <Link href="/treinamentos/subtemas" className="text-xs text-red-400 hover:text-red-300 underline">
                  Cadastrar em Subtemas
                </Link>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-center gap-4 px-4 py-3 bg-white/[0.03] border-t border-white/[0.08] flex-shrink-0">
            <button
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              disabled={index === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/[0.1] text-sm text-gray-300 hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <button
              onClick={() => setIndex((i) => Math.min(i + 1, aulas.length - 1))}
              disabled={index === aulas.length - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
