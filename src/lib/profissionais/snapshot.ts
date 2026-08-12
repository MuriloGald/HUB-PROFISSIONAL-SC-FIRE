import type { Profissional } from "@/lib/supabase/types";
import type { ProfissionalSnapshot } from "./types";

/** Converte um registro de profissional do banco no snapshot embutido nos documentos (laudos.dados). */
export function profissionalParaSnapshot(p: Profissional): ProfissionalSnapshot {
  return {
    id: p.id,
    nome: p.nome,
    cpf: p.cpf ?? undefined,
    telefone: p.telefone ?? undefined,
    email: p.email ?? undefined,
    registro_tipo: p.registro_tipo ?? undefined,
    registro_numero: p.registro_numero ?? undefined,
  };
}
