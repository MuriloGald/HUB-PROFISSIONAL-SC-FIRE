"use client";

import { useMemo, useState, useTransition } from "react";
import { Bot, Save, Sparkles, Send } from "lucide-react";
import { saveSdrConfig } from "@/app/actions/crm-agente";
import { buildPromptFromSdrConfig } from "@/lib/crm/promptBuilder";
import type { SdrConfig } from "@/lib/crm/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

const GEMINI_KEY_STORAGE = "scfire_gemini_api_key";

export function AgenteIaForm({ config }: { config: SdrConfig }) {
  const [form, setForm] = useState(config);
  const [pending, startTransition] = useTransition();
  const [salvo, setSalvo] = useState(false);

  const prompt = useMemo(() => buildPromptFromSdrConfig(form), [form]);

  function set<K extends keyof SdrConfig>(key: K, value: SdrConfig[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSalvo(false);
  }

  function salvar() {
    startTransition(async () => {
      const res = await saveSdrConfig(config.id, {
        agent_name: form.agent_name,
        company_context: form.company_context,
        products: form.products,
        qualification_criteria: form.qualification_criteria,
        communication_style: form.communication_style,
        handoff_rules: form.handoff_rules,
        enabled: form.enabled,
      });
      if (res.error) {
        alert(res.error);
        return;
      }
      setSalvo(true);
    });
  }

  return (
    <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0">
      <div className="space-y-4 overflow-y-auto pr-1">
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-3.5 h-3.5" /> Persona
            </h2>
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => set("enabled", e.target.checked)}
                className="accent-red-500"
              />
              Agente ativo
            </label>
          </div>
          <div>
            <label className={labelClass}>Nome do agente</label>
            <input className={inputClass} value={form.agent_name} onChange={(e) => set("agent_name", e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Empresa e produtos</h2>
          <div>
            <label className={labelClass}>Sobre a empresa</label>
            <textarea
              className={inputClass}
              rows={3}
              value={form.company_context}
              onChange={(e) => set("company_context", e.target.value)}
              placeholder="O que a SC Fire oferece, para quem, diferenciais…"
            />
          </div>
          <div>
            <label className={labelClass}>Produtos / ofertas</label>
            <textarea className={inputClass} rows={3} value={form.products} onChange={(e) => set("products", e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Atendimento</h2>
          <div>
            <label className={labelClass}>Critérios de qualificação</label>
            <textarea
              className={inputClass}
              rows={3}
              value={form.qualification_criteria}
              onChange={(e) => set("qualification_criteria", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Estilo de comunicação</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.communication_style}
              onChange={(e) => set("communication_style", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Encaminhamento humano</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.handoff_rules}
              onChange={(e) => set("handoff_rules", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={salvar}
            disabled={pending}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-500/10 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {pending ? "Salvando..." : "Salvar configuração"}
          </button>
          {salvo && <span className="text-xs text-emerald-400">Salvo.</span>}
        </div>
      </div>

      <div className="flex flex-col gap-4 min-h-0">
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 flex-1 min-h-0 flex flex-col">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prompt montado</h2>
          <pre className="flex-1 overflow-y-auto text-[11px] text-gray-300 whitespace-pre-wrap leading-relaxed">{prompt}</pre>
        </div>
        <GeminiPlayground prompt={prompt} />
      </div>
    </div>
  );
}

function GeminiPlayground({ prompt }: { prompt: string }) {
  const [apiKey, setApiKey] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(GEMINI_KEY_STORAGE) ?? "" : ""
  );
  const [mensagem, setMensagem] = useState("");
  const [resposta, setResposta] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function salvarChave(v: string) {
    setApiKey(v);
    localStorage.setItem(GEMINI_KEY_STORAGE, v);
  }

  async function testar() {
    if (!apiKey.trim() || !mensagem.trim()) return;
    setLoading(true);
    setResposta(null);
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: prompt }] },
            contents: [{ role: "user", parts: [{ text: mensagem }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
          }),
        }
      );
      const raw = await resp.text();
      const data = raw ? JSON.parse(raw) : {};
      const texto =
        data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ||
        data?.error?.message ||
        "Sem resposta.";
      setResposta(texto);
    } catch {
      setResposta("Falha ao chamar a API do Gemini. Confira a chave.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-2">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5" /> Playground (Gemini)
      </h2>
      <input
        className={inputClass}
        type="password"
        value={apiKey}
        onChange={(e) => salvarChave(e.target.value)}
        placeholder="Chave da API Gemini (fica só no seu navegador)"
      />
      <div className="flex gap-2">
        <input
          className={inputClass}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Escreva como se fosse um lead…"
          onKeyDown={(e) => e.key === "Enter" && testar()}
        />
        <button
          onClick={testar}
          disabled={loading || !apiKey.trim() || !mensagem.trim()}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      {loading && <p className="text-xs text-gray-500">Consultando...</p>}
      {resposta && <p className="text-xs text-gray-300 whitespace-pre-wrap border-t border-white/[0.06] pt-2 mt-1">{resposta}</p>}
      <p className="text-[10px] text-gray-600">
        Chave grátis em <span className="text-gray-400">aistudio.google.com/app/apikey</span>. Guardada só neste
        navegador — nunca envie a chave real pro backend.
      </p>
    </div>
  );
}
