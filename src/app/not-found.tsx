import Link from "next/link";
import { Construction, ArrowLeft, Flame } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 flex flex-col items-center gap-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
          <Construction className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            Estamos em obra por aqui!
          </h1>
          <p className="text-sm text-gray-400">
            Esse módulo ainda está sendo construído. Volte em breve — ou clique abaixo para voltar ao início.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.02] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Clique aqui para voltar
        </Link>
      </div>
    </div>
  );
}
