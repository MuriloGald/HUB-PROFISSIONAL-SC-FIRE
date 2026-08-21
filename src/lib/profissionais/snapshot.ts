import type { Profissional } from "@/lib/supabase/types";
import { formatCPF } from "@/lib/laudos/formatters";
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

/** Rótulo curto de identificação do profissional pros seletores de RT — CREA/CFT com o número, ou o CPF pra quem não tem registro em conselho de classe. */
export function rotuloIdentificacaoProfissional(p: Profissional): string {
  if (p.registro_tipo === "cft") return `CFT ${p.registro_numero ?? ""}`;
  if (p.registro_tipo === "crea") return `CREA/SC ${p.registro_numero ?? ""}`;
  return p.cpf ? `CPF ${formatCPF(p.cpf)}` : "sem registro";
}
