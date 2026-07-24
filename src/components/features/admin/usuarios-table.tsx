"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, UserCog, X } from "lucide-react";
import { atualizarPapelUsuario, criarUsuario, excluirUsuario, type Usuario } from "@/app/actions/usuarios";
import type { AppRole } from "@/lib/auth/roles";

const inputClass =
  "w-full px-3 py-2 text-sm text-white bg-black/20 border border-white/[0.08] rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider";

const ROLE_LABEL: Record<AppRole, string> = {
  diretor: "Diretor",
  administrador: "Administrador",
  professor: "Professor",
};

const ROLE_BADGE: Record<AppRole, string> = {
  diretor: "bg-red-500/15 text-red-300",
  administrador: "bg-blue-500/15 text-blue-300",
  professor: "bg-emerald-500/15 text-emerald-300",
};

export function UsuariosTable({ usuariosIniciais }: { usuariosIniciais: Usuario[] }) {
  const [usuarios, setUsuarios] = useState(usuariosIniciais);
  const [modalAberto, setModalAberto] = useState(false);
  const [pending, startTransition] = useTransition();

  function trocarPapel(userId: string, role: AppRole) {
    const anterior = usuarios;
    setUsuarios((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    startTransition(async () => {
      const res = await atualizarPapelUsuario(userId, role);
      if (res.error) {
        setUsuarios(anterior);
        alert(res.error);
      }
    });
  }

  function excluir(u: Usuario) {
    if (!confirm(`Excluir a conta de "${u.full_name || u.email}"? Essa ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      const res = await excluirUsuario(u.id);
      if (res.error) {
        alert(res.error);
        return;
      }
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setModalAberto(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-500/10 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo usuário
        </button>
      </div>

      <div className="rounded-xl border border-white/[0.08] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-white font-medium">{u.full_name || "—"}</td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => trocarPapel(u.id, e.target.value as AppRole)}
                    disabled={pending}
                    className={`px-2 py-1 text-xs font-semibold rounded-md border-0 ${ROLE_BADGE[u.role]}`}
                  >
                    {(Object.keys(ROLE_LABEL) as AppRole[]).map((r) => (
                      <option key={r} value={r} className="bg-[#111625] text-white">
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => excluir(u)}
                    disabled={pending}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                    title="Excluir usuário"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Nenhum usuário cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && <NovoUsuarioModal onClose={() => setModalAberto(false)} onCriado={(u) => setUsuarios((prev) => [...prev, u])} />}
    </div>
  );
}

function NovoUsuarioModal({ onClose, onCriado }: { onClose: () => void; onCriado: (u: Usuario) => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("professor");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function criar() {
    if (!email.trim() || !fullName.trim()) {
      setErro("Preencha nome e e-mail.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      const res = await criarUsuario({ email, fullName, role, senhaProvisoria: senha });
      if (res.error || !res.data) {
        setErro(res.error ?? "Não foi possível criar o usuário.");
        return;
      }
      onCriado(res.data);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0c0d12] border border-white/[0.08] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-red-400" /> Novo usuário
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className={labelClass}>Nome completo</label>
          <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Papel</label>
          <select value={role} onChange={(e) => setRole(e.target.value as AppRole)} className={inputClass}>
            {(Object.keys(ROLE_LABEL) as AppRole[]).map((r) => (
              <option key={r} value={r} className="bg-[#111625]">
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Senha provisória</label>
          <input
            className={inputClass}
            type="text"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="mínimo 6 caracteres"
          />
          <p className="text-[10px] text-gray-600 mt-1">
            Repasse essa senha à pessoa. Ela pode trocá-la depois em &quot;Esqueci minha senha&quot;.
          </p>
        </div>

        {erro && <p className="text-xs text-red-400">{erro}</p>}

        <button
          onClick={criar}
          disabled={pending}
          className="w-full py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
        >
          {pending ? "Criando..." : "Criar usuário"}
        </button>
      </div>
    </div>
  );
}
