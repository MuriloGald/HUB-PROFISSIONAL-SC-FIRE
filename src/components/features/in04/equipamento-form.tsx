"use client";

import { CheckCircle2, X } from "lucide-react";
import { RespostaToggle } from "@/components/features/shared/resposta-toggle";
import { ImageUploader } from "@/components/features/shared/image-uploader";
import { somarMeses } from "@/lib/shared/date-format";
import type { CategoriaChecklist } from "@/lib/in04/constants";
import type { EquipamentoVistoriado, RespostaChecklist3 } from "@/lib/in04/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

interface EquipamentoFormProps {
  categoria: CategoriaChecklist;
  equipamento: EquipamentoVistoriado;
  onChange: (equipamento: EquipamentoVistoriado) => void;
  onSalvar: () => void;
  onCancelar: () => void;
}

export function EquipamentoForm({ categoria, equipamento, onChange, onSalvar, onCancelar }: EquipamentoFormProps) {
  function setResposta(chave: string, resposta: RespostaChecklist3) {
    onChange({
      ...equipamento,
      respostas: { ...equipamento.respostas, [chave]: { ...equipamento.respostas[chave], resposta } },
    });
  }

  function setAcompanhamento(chave: string, campo: "dataAcompanhamento" | "numeroDrt", valor: string) {
    const atual = equipamento.respostas[chave] ?? { resposta: "" as RespostaChecklist3 };
    onChange({ ...equipamento, respostas: { ...equipamento.respostas, [chave]: { ...atual, [campo]: valor } } });
  }

  const podeSalvar = equipamento.identificacao.trim().length > 0;

  return (
    <div className="rounded-xl bg-black/20 border border-red-500/20 p-5 space-y-5">
      <div className="space-y-1.5">
        <label className={labelClass}>{categoria.labelIdentificacao}</label>
        <input
          autoFocus
          className={inputClass}
          value={equipamento.identificacao}
          onChange={(e) => onChange({ ...equipamento, identificacao: e.target.value })}
          placeholder="Ex.: nº 12, corredor do 3º andar..."
        />
      </div>

      <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] overflow-hidden">
        {categoria.perguntas.map((pergunta) => {
          const resposta = equipamento.respostas[pergunta.chave];
          const mostrarAcompanhamento = pergunta.exigeAcompanhamento && resposta?.resposta === "sim";
          const vencimento =
            mostrarAcompanhamento && pergunta.periodicidadeMeses && resposta?.dataAcompanhamento
              ? somarMeses(resposta.dataAcompanhamento, pergunta.periodicidadeMeses)
              : "";
          return (
            <div key={pergunta.chave} className="bg-white/[0.02] px-4 py-3 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-gray-300 flex-1">{pergunta.texto}</p>
                <RespostaToggle value={resposta?.resposta ?? ""} onChange={(v) => setResposta(pergunta.chave, v as RespostaChecklist3)} comNa />
              </div>
              {mostrarAcompanhamento && (
                <div className="flex flex-wrap items-end gap-3 pl-1">
                  <div className="space-y-1">
                    <label className={labelClass}>{pergunta.tipoAcompanhamento === "drt" ? "Data do último DRT" : "Data da última validade"}</label>
                    <input
                      type="date"
                      className={`${inputClass} max-w-[10rem]`}
                      value={resposta?.dataAcompanhamento ?? ""}
                      onChange={(e) => setAcompanhamento(pergunta.chave, "dataAcompanhamento", e.target.value)}
                    />
                  </div>
                  {pergunta.tipoAcompanhamento === "drt" && (
                    <div className="space-y-1">
                      <label className={labelClass}>Nº do DRT</label>
                      <input
                        className={`${inputClass} max-w-[10rem]`}
                        value={resposta?.numeroDrt ?? ""}
                        onChange={(e) => setAcompanhamento(pergunta.chave, "numeroDrt", e.target.value)}
                      />
                    </div>
                  )}
                  {vencimento && <p className="text-[11px] text-amber-400 font-semibold pb-2">Próximo vencimento: {vencimento}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Observações</label>
        <textarea
          rows={2}
          className={inputClass}
          value={equipamento.observacoes ?? ""}
          onChange={(e) => onChange({ ...equipamento, observacoes: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Fotos</label>
        <ImageUploader imagens={equipamento.imagens} onChange={(imagens) => onChange({ ...equipamento, imagens })} />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancelar}
          className="px-3 py-2 border border-white/[0.08] hover:border-white/20 text-gray-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <X className="w-3.5 h-3.5" /> Cancelar
        </button>
        <button
          type="button"
          disabled={!podeSalvar}
          onClick={onSalvar}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Salvar {categoria.tituloSingular.toLowerCase()}
        </button>
      </div>
    </div>
  );
}
