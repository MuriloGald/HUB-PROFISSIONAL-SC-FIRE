"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Plus, Wifi, WifiOff } from "lucide-react";
import { createInstance, connectInstance } from "@/app/actions/crm-whatsapp";
import type { WhatsappInstance } from "@/lib/crm/types";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";

export function WhatsappInstances({ instanciasIniciais }: { instanciasIniciais: WhatsappInstance[] }) {
  const [instancias, setInstancias] = useState(instanciasIniciais);
  const [nome, setNome] = useState("");
  const [pending, startTransition] = useTransition();

  function criar() {
    if (!nome.trim()) return;
    startTransition(async () => {
      const res = await createInstance(nome);
      if (res.error) {
        alert(res.error);
        return;
      }
      setInstancias((prev) => [res.data!, ...prev]);
      setNome("");
    });
  }

  function conectar(id: string) {
    startTransition(async () => {
      const res = await connectInstance(id);
      if (res.error) {
        alert(res.error);
        return;
      }
      setInstancias((prev) => prev.map((i) => (i.id === id ? res.data! : i)));
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nova instância</label>
          <input
            className={inputClass}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Comercial SC Fire"
            onKeyDown={(e) => e.key === "Enter" && criar()}
          />
        </div>
        <button
          onClick={criar}
          disabled={pending || !nome.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Cadastrar
        </button>
      </div>

      <div className="space-y-2">
        {instancias.length === 0 && <p className="text-sm text-gray-500">Nenhuma instância cadastrada ainda.</p>}
        {instancias.map((i) => (
          <div
            key={i.id}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{i.name}</h4>
                <p className="text-xs text-gray-500">{i.phone ?? "sem número ainda"}</p>
              </div>
            </div>
            {i.status === "connected" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-md">
                <Wifi className="w-3.5 h-3.5" /> Conectado
              </span>
            ) : (
              <button
                onClick={() => conectar(i.id)}
                disabled={pending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.1] hover:bg-white/[0.04] text-gray-300 text-xs font-semibold rounded-md transition-colors"
              >
                <WifiOff className="w-3.5 h-3.5" /> Conectar
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-600">
        Conexão real com a API da UaiZapi (QR code, envio/recebimento de mensagens) fica pra uma próxima etapa —
        hoje o botão só marca a instância como conectada.
      </p>
    </div>
  );
}
