"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Question } from "./question";
import { PERGUNTAS_MAP } from "@/lib/laudos/constants";
import { ProfissionalCampoSelect } from "@/components/features/profissionais/profissional-campo-select";
import { formatarRegistroProfissional } from "@/lib/shared/pdf-branding";
import type { Respostas } from "@/lib/laudos/types";
import type { Profissional } from "@/lib/supabase/types";
import type { ProfissionalSnapshot } from "@/lib/profissionais/types";

interface FormsPequenoProps {
  respostas: Respostas;
  profissionais: Profissional[];
  onBack: (respostas: Respostas) => void;
  onNext: (respostas: Respostas) => void;
}

/** Questionário de evento de Pequeno Porte (Anexo B). */
export function FormsPequeno({ respostas: inicial, profissionais, onBack, onNext }: FormsPequenoProps) {
  const [respostas, setRespostas] = useState<Respostas>(inicial);

  function set(key: string, value: string) {
    setRespostas((r) => ({ ...r, [key]: value }));
  }

  function setRt(profissionalId: string, p: ProfissionalSnapshot | undefined) {
    setRespostas((r) => ({
      ...r,
      rt_selecionado: profissionalId,
      rt_nome: p?.nome ?? "",
      rt_cpf: p?.cpf ?? "",
      rt_telefone: p?.telefone ?? "",
      rt_email: p?.email ?? "",
      rt_registro: p ? formatarRegistroProfissional({ nome: p.nome, registroTipo: p.registro_tipo, registroNumero: p.registro_numero }) : "",
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext(respostas);
  }

  const camposGerais = ["CGPP01", "CGPP02", "CGPP03", "CGPP04"];
  const camposProvisorias = ["PROVISORIAPP01", "PROVISORIAPP02", "PROVISORIAPP03", "PROVISORIAPP04"];

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6 space-y-6">
      <h3 className="text-lg font-bold text-white">Preenchimento: Evento de Pequeno Porte</h3>

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">Características gerais</h4>
      {camposGerais.map((key) => (
        <Question key={key} name={key} label={PERGUNTAS_MAP[key]} value={respostas[key]} onChange={(v) => set(key, v)} />
      ))}

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Instalações de Gás Combustível</h4>
      <Question name="GLPPP" label={PERGUNTAS_MAP.GLPPP} value={respostas.GLPPP} onChange={(v) => set("GLPPP", v)} />

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Estruturas provisórias</h4>
      {camposProvisorias.map((key) => (
        <Question key={key} name={key} label={PERGUNTAS_MAP[key]} value={respostas[key]} onChange={(v) => set(key, v)} />
      ))}

      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2 pt-2">Responsável Técnico (RT)</h4>
      <ProfissionalCampoSelect
        profissionais={profissionais}
        value={respostas.rt_selecionado}
        label="Selecione o RT que assinará o Laudo"
        redirectToNovoProfissional="/laudos/eventos/novo"
        onChange={setRt}
      />

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => onBack(respostas)}
          className="px-4 py-2 border border-white/[0.08] hover:border-red-500/50 hover:bg-white/[0.04] text-white hover:text-red-500 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Revisar e Gerar PDF <Check className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
