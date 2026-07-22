"use client";

interface Opcao {
  value: string;
  label: string;
  activeClass: string;
}

const SIM_NAO: Opcao[] = [
  { value: "sim", label: "Sim", activeClass: "bg-emerald-500 text-white" },
  { value: "nao", label: "Não", activeClass: "bg-red-500 text-white" },
];

const SIM_NAO_NA: Opcao[] = [...SIM_NAO, { value: "na", label: "NA", activeClass: "bg-gray-500 text-white" }];

interface RespostaToggleProps {
  value: string;
  onChange: (v: string) => void;
  comNa?: boolean;
}

/** Toggle de resposta Sim/Não (ou Sim/Não/NA) reutilizado pelos checklists dos "preenchíveis" (IN 09, IN 15 etc). */
export function RespostaToggle({ value, onChange, comNa = false }: RespostaToggleProps) {
  const opcoes = comNa ? SIM_NAO_NA : SIM_NAO;
  return (
    <div className="flex rounded-lg border border-white/[0.08] overflow-hidden flex-shrink-0">
      {opcoes.map((o, i) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-xs font-semibold transition-all ${i > 0 ? "border-l border-white/[0.08]" : ""} ${
            value === o.value ? o.activeClass : "text-gray-400 hover:bg-white/[0.04]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface ChoiceGroupProps {
  opcoes: string[];
  value: string;
  onChange: (v: string) => void;
}

/** Grupo de escolha única (ex: Risco Leve/Ordinário I/II) — mesma família visual do RespostaToggle. */
export function ChoiceGroup({ opcoes, value, onChange }: ChoiceGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            value === o ? "bg-red-500 text-white border-red-500" : "text-gray-400 border-white/[0.08] hover:bg-white/[0.04]"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

interface ChecklistItemGenerico {
  chave: string;
  texto: string;
}

interface ChecklistGenericoProps {
  titulo: string;
  itens: ChecklistItemGenerico[];
  respostas: Record<string, string>;
  onChange: (chave: string, resposta: string) => void;
  comNa?: boolean;
}

/** Seção de checklist genérica (numero + texto + toggle) — reutilizada por vários Anexos de comissionamento/inspeção. */
export function ChecklistGenerico({ titulo, itens, respostas, onChange, comNa }: ChecklistGenericoProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-white border-l-2 border-red-500 pl-2">{titulo}</h4>
      <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] overflow-hidden">
        {itens.map((item) => (
          <div key={item.chave} className="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02]">
            <p className="text-xs text-gray-300 flex-1">
              <span className="text-gray-500 font-semibold mr-1.5">{item.chave}</span>
              {item.texto}
            </p>
            <RespostaToggle value={respostas[item.chave] ?? ""} onChange={(v) => onChange(item.chave, v)} comNa={comNa} />
          </div>
        ))}
      </div>
    </div>
  );
}
