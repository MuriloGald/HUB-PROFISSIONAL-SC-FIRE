"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, ScrollText, Trash2 } from "lucide-react";
import { excluirSubtema } from "@/app/actions/subtemas";

export function SubtemaRowActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleExcluir() {
    if (!confirm(`Excluir "${name}"? Isso também remove o vínculo com qualquer curso.`)) return;
    startTransition(async () => {
      const res = await excluirSubtema(id);
      if (res.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        href={`/treinamentos/subtemas/${id}/roteiro`}
        title="Roteiro de aula"
        className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
      >
        <ScrollText className="w-3.5 h-3.5" />
      </Link>
      <Link href={`/treinamentos/subtemas/${id}/editar`} title="Editar dados" className="p-1.5 rounded-md hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors">
        <Pencil className="w-3.5 h-3.5" />
      </Link>
      <button
        onClick={handleExcluir}
        disabled={pending}
        className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
