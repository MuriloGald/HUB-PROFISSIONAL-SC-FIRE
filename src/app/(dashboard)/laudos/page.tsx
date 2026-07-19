import Link from "next/link";
import { Users, CalendarPlus, FileText, FileSignature, PieChart } from "lucide-react";
import { listarLaudosEvento } from "@/app/actions/laudos";
import { listarClientes } from "@/app/actions/clientes";
import type { EventoWizardState } from "@/lib/laudos/types";

export default async function LaudosDashboardPage() {
  const [{ data: clientes }, { data: laudos }] = await Promise.all([listarClientes(), listarLaudosEvento()]);

  const porPorte = laudos.reduce(
    (acc, l) => {
      const porte = (l.dados as EventoWizardState).porteFinal;
      if (porte) acc[porte] += 1;
      return acc;
    },
    { pequeno: 0, medio: 0, grande: 0 }
  );

  const acoes = [
    {
      title: "Cadastrar Evento",
      desc: "Inicie o fluxo de emissão de um novo laudo de evento.",
      icon: CalendarPlus,
      href: "/laudos/eventos/novo",
      color: "from-emerald-600 to-emerald-400",
    },
    {
      title: "Consultar Laudos",
      desc: "Veja os últimos eventos cadastrados, gere os PDFs ou exclua registros.",
      icon: FileText,
      href: "/laudos/eventos",
      color: "from-red-600 to-orange-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Gerador de Laudos — Eventos (IN 24)</h1>
        <p className="text-sm text-gray-400 mt-1">Emissão de laudos técnicos e termos de responsabilidade para eventos temporários conforme IN 24 CBMSC.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/clientes" className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-all flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Clientes Cadastrados</span>
            <div className="text-2xl font-bold text-white mt-1">{clientes.length}</div>
          </div>
          <Users className="w-8 h-8 text-blue-500/30" />
        </Link>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Laudos Emitidos</span>
            <div className="text-2xl font-bold text-white mt-1">{laudos.length}</div>
          </div>
          <FileSignature className="w-8 h-8 text-red-500/30" />
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Eventos por Tamanho</span>
            <div className="text-lg font-bold text-white mt-1">
              P: {porPorte.pequeno} <span className="text-gray-600">|</span> M: {porPorte.medio} <span className="text-gray-600">|</span> G: {porPorte.grande}
            </div>
          </div>
          <PieChart className="w-8 h-8 text-amber-500/30" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {acoes.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="group relative flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${a.color} flex items-center justify-center shadow-lg shadow-black/30 mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
              <a.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors font-display">{a.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{a.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
