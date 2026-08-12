import type { RegistroConselhoTipo } from "@/lib/supabase/types";

/** Snapshot do profissional embutido em qualquer documento (laudos.dados) no momento da geracao — preserva os dados exibidos no PDF mesmo que o cadastro mude depois. */
export interface ProfissionalSnapshot {
  id: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  registro_tipo?: RegistroConselhoTipo;
  registro_numero?: string;
}
