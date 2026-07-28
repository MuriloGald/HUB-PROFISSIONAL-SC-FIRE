import Link from "next/link";
import { Building2, ClipboardList, FileText, ShieldCheck, CalendarPlus, KanbanSquare } from "lucide-react";
import { listarVistorias, listarLaudosTecnicos } from "@/app/actions/save-in23";
import { listarClientes } from "@/app/actions/clientes";
import { listarProcessosSave23 } from "@/app/actions/save23-processos";
import { avaliarSetor } from "@/lib/save-in23/classificador";
import type { VistoriaWizardState } from "@/lib/save-in23/types";

export default async function Save23DashboardPage() {
  const [{ data: clientes }, { data: vistorias }, { data: laudos }, { data: processos }] = await Promise.all([
    listarClientes(),
    listarVistorias(),
    listarLaudosTecnicos(),
    listarProcessosSave23(),
  ]);

  const setoresDispensados = vistorias.reduce((acc, l) => {
    const dados = l.dados as unknown as VistoriaWizardState;
    return acc + dados.setores.filter((s) => avaliarSetor(s, dados.cliente?.preexistente).dispensado).length;
  }, 0);

  const acoes = [
    {
      title: "Nova Vistoria de Campo",
      desc: "Checklist por setor, avaliação de dispensa do PBD (Art. 6º).",
      icon: ClipboardList,
      href: "/relatorios/save-in23/vistorias/nova",
      color: "from-emerald-600 to-emerald-400",
    },
    {
      title: "Novo Laudo Técnico",
      desc: "Assistente guiado por capítulos — Orientação Técnica de dispensa do PBD.",
      icon: CalendarPlus,
      href: "/relatorios/save-in23/laudos/novo",
      color: "from-red-600 to-orange-400",
    },
    {
      title: "Acompanhamento de Processos",
      desc: "Quadro do status de atendimento de cada condomínio — do contato inicial à dispensa concedida.",
      icon: KanbanSquare,
      href: "/relatorios/save-in23/processos",
      color: "from-blue-600 to-cyan-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Vistoria e Laudo Técnico — SAVE 23</h1>
        <p className="text-sm text-gray-400 mt-1">
          Avaliação de dispensa do PBD para locais com Sistema de Alimentação para Veículos Elétricos, conforme Art. 6º da IN 23/CBMSC.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Link href="/clientes" className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-all flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Clientes Cadastrados</span>
            <div className="text-2xl font-bold text-white mt-1">{clientes.length}</div>
          </div>
          <Building2 className="w-8 h-8 text-blue-500/30" />
        </Link>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vistorias Realizadas</span>
            <div className="text-2xl font-bold text-white mt-1">{vistorias.length}</div>
          </div>
          <ClipboardList className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Setores Dispensados</span>
            <div className="text-2xl font-bold text-white mt-1">{setoresDispensados}</div>
          </div>
          <ShieldCheck className="w-8 h-8 text-amber-500/30" />
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Laudos Técnicos</span>
            <div className="text-2xl font-bold text-white mt-1">{laudos.length}</div>
          </div>
          <FileText className="w-8 h-8 text-red-500/30" />
        </div>

        <Link
          href="/relatorios/save-in23/processos"
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Processos em Andamento</span>
            <div className="text-2xl font-bold text-white mt-1">{processos.length}</div>
          </div>
          <KanbanSquare className="w-8 h-8 text-cyan-500/30" />
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
