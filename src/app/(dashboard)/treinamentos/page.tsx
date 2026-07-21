import Link from "next/link";
import { GraduationCap, BookOpen, Users, Presentation, Library, Clock } from "lucide-react";
import { listarCursosTreinador } from "@/app/actions/treinador";
import { listarSubtemas } from "@/app/actions/subtemas";
import { listarTurmas } from "@/app/actions/turmas";

export default async function TreinamentosDashboardPage() {
  const [{ data: cursos }, { data: subtemas }, { data: turmas }] = await Promise.all([
    listarCursosTreinador(),
    listarSubtemas(),
    listarTurmas(),
  ]);

  const acoes = [
    {
      title: "Cursos",
      desc: "Cadastre cursos e monte o currículo — quais subtemas, em qual ordem, com qual duração.",
      icon: GraduationCap,
      href: "/treinamentos/cursos",
      color: "from-emerald-600 to-emerald-400",
    },
    {
      title: "Subtemas",
      desc: "Catálogo de aulas/componentes — nome, módulo, duração, link do Canva e roteiro de aula.",
      icon: BookOpen,
      href: "/treinamentos/subtemas",
      color: "from-blue-600 to-blue-400",
    },
    {
      title: "Turmas",
      desc: "Turmas agendadas ou em andamento, vinculadas a um cliente — presença por QR Code.",
      icon: Users,
      href: "/treinamentos/turmas",
      color: "from-amber-600 to-yellow-400",
    },
    {
      title: "Treinador",
      desc: "Leitor de roteiro de aula — contexto, explicação, verificação e fechamento de cada componente.",
      icon: Library,
      href: "/treinador",
      color: "from-purple-600 to-indigo-400",
    },
    {
      title: "Apresentação",
      desc: "Cockpit do instrutor — conduz a aula em tela cheia, avulso ou com turma cadastrada.",
      icon: Presentation,
      href: "/apresentacao",
      color: "from-red-600 to-orange-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Área de Treinamentos</h1>
        <p className="text-sm text-gray-400 mt-1">Cursos, currículo, turmas e o ambiente de instrução do brigadista orgânico.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cursos</span>
            <div className="text-2xl font-bold text-white mt-1">{cursos.length}</div>
          </div>
          <GraduationCap className="w-8 h-8 text-emerald-500/30" />
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Subtemas Cadastrados</span>
            <div className="text-2xl font-bold text-white mt-1">{subtemas.length}</div>
          </div>
          <BookOpen className="w-8 h-8 text-blue-500/30" />
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Turmas Ativas</span>
            <div className="text-2xl font-bold text-white mt-1">{turmas.length}</div>
          </div>
          <Clock className="w-8 h-8 text-amber-500/30" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
