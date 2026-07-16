"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Mail, Lock, AlertTriangle, Loader2 } from "lucide-react";
import { login } from "@/app/actions/auth";

type LoginState = { error?: string } | null;

async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const result = await login(formData);
  return result ?? null;
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <div className="min-h-dvh bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center z-10 mb-8">
        <div className="w-28 h-28 mx-auto rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-2xl shadow-red-500/10 mb-6 p-4">
          <Image
            src="/logo-sc-fire.png"
            alt="SC FIRE"
            width={120}
            height={120}
            className="object-contain w-full h-full"
            priority
          />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          SC FIRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">HUB</span>
        </h1>
        <p className="text-sm text-gray-400 mt-2">Entre com seu e-mail e senha para acessar o painel.</p>
      </div>

      <form
        action={formAction}
        className="z-10 w-full max-w-sm bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4"
      >
        {state?.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            E-mail
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="seu@email.com"
            className="w-full h-11 px-3.5 rounded-lg bg-black/40 border border-white/[0.08] text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Senha
          </label>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full h-11 px-3.5 rounded-lg bg-black/40 border border-white/[0.08] text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
        </button>
      </form>
    </div>
  );
}
