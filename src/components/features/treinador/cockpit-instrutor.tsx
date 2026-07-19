"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, Timer, Radio, GraduationCap, Check, MonitorPlay, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
  const progressoPercent = aulas.length > 1 ? Math.round((index / (aulas.length - 1)) * 100) : 100;

  return (
    <div className="fixed inset-0 flex flex-col h-dvh overflow-hidden bg-background text-foreground select-none z-50">
      {/* Top bar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 z-20 flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2 text-primary flex-shrink-0">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Apresentação Avulsa</span>
          </div>

          <div className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-lg bg-surface border border-border text-left min-w-0">
            <GraduationCap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground truncate max-w-[280px]">{curso.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface border border-border">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold font-mono tracking-wider">{formatarTempo(segundos)}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {index + 1} / {aulas.length}
          </span>
          <Link
            href="/apresentacao"
            className="p-2 rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground transition-all"
            title="Voltar para seleção"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        {sidebarAberta && (
          <aside className="w-80 bg-card border-r border-border flex flex-col flex-shrink-0 z-10">
            <div className="p-5 border-b border-border bg-surface/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase">Progresso</span>
                <span className="text-xs font-extrabold text-primary">{progressoPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressoPercent}%` }} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2">
                <span>{index} concluídos</span>
                <span>{aulas.length - index - 1} restantes</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {aulas.map((a, idx) => {
                const isActive = idx === index;
                const isDone = idx < index;
                return (
                  <div
                    key={a.id}
                    onClick={() => setIndex(idx)}
                    className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                      isActive
                        ? "bg-primary/10 border-primary shadow-md shadow-primary/5"
                        : isDone
                          ? "bg-surface/40 border-border text-muted-foreground hover:bg-surface/70"
                          : "bg-card border-border hover:border-primary/20 hover:bg-surface/20"
                    }`}
                  >
                    <div className="flex items-start gap-3 relative z-10 text-left">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border text-[10px] font-bold transition-all ${
                          isActive
                            ? "bg-primary border-primary text-white"
                            : isDone
                              ? "bg-success border-success text-white"
                              : "bg-surface border-border text-muted-foreground"
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-bold leading-snug ${isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"}`}>
                          {a.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                          <span>{a.category}</span>
                          <span>·</span>
                          <span>{a.hours}h</span>
                        </div>
                      </div>
                    </div>
                    {isActive && <div className="absolute inset-y-0 left-0 w-[3px] bg-primary" />}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Main viewport */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#07080b] p-6 relative">
          <div className="flex-1 rounded-2xl overflow-hidden bg-card border border-border shadow-2xl relative">
            {embedUrl ? (
              <iframe key={aula.id} src={embedUrl} className="w-full h-full border-0 absolute inset-0" allowFullScreen allow="fullscreen" title={aula.name} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-muted-foreground border border-border shadow-inner">
                  <MonitorPlay className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-base font-bold text-foreground">Apresentação não vinculada</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Este subtema (<strong>{aula.name}</strong>) não possui um link de apresentação do Canva cadastrado no catálogo.
                  </p>
                  <Link href="/treinamentos/subtemas" className="text-xs text-primary hover:underline">
                    Cadastrar em Subtemas
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="h-16 flex items-center justify-between mt-4 flex-shrink-0 z-10 px-4 bg-card/60 backdrop-blur border border-border rounded-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarAberta((v) => !v)}
                className="h-10 px-3 rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={sidebarAberta ? "Ocultar lista" : "Mostrar lista"}
              >
                {sidebarAberta ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                disabled={index === 0}
                className="h-10 px-4 rounded-lg bg-surface border border-border text-xs font-semibold hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>

              {index === aulas.length - 1 ? (
                <Link
                  href="/apresentacao"
                  className="h-10 px-4 rounded-lg bg-destructive text-white text-xs font-bold shadow-md shadow-destructive/20 hover:shadow-lg hover:bg-destructive/90 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Encerrar Apresentação
                </Link>
              ) : (
                <button
                  onClick={() => setIndex((i) => Math.min(i + 1, aulas.length - 1))}
                  className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/10 hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  Avançar <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <span className="text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:block">Setas do teclado navegam entre as aulas</span>
          </div>
        </main>
      </div>
    </div>
  );
}
