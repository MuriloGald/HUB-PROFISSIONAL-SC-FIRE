import type { Cliente } from "@/lib/supabase/types";
import type { ClienteSnapshot } from "./types";

/** Converte um registro de cliente do banco no snapshot embutido nos documentos (laudos.dados). */
export function clienteParaSnapshot(c: Cliente): ClienteSnapshot {
  const digits = c.cnpj_cpf?.replace(/\D/g, "") ?? "";
  return {
    id: c.id,
    razao_social: c.razao_social ?? c.nome,
    cnpj: digits.length === 14 ? c.cnpj_cpf ?? undefined : undefined,
    cpf: digits.length === 11 ? c.cnpj_cpf ?? undefined : undefined,
    nome_responsavel: c.responsavel_nome ?? undefined,
    email: c.email ?? undefined,
    telefone: c.telefone ?? undefined,
    logradouro: c.logradouro ?? undefined,
    numero: c.numero ?? undefined,
    bairro: c.bairro ?? undefined,
    complemento: c.complemento ?? undefined,
    cidade: c.cidade ?? undefined,
    estado: c.estado ?? undefined,
    cep: c.cep ?? undefined,
    re: c.re ?? undefined,
    preexistente: c.preexistente ?? undefined,
    area_construida: c.area_construida ?? undefined,
    pavimentos: c.pavimentos ?? undefined,
    altura: c.altura ?? undefined,
    validade_atestado: c.validade_atestado ?? undefined,
  };
}

/**
 * Preenche campos ausentes de um snapshot já congelado (documento antigo reaberto
 * pra editar) com os dados atuais do cliente — sem sobrescrever valores que o
 * snapshot já tinha preservado de propósito (ver docstring de ClienteSnapshot).
 * Cobre o caso de um campo (ex: "re") ter sido adicionado ao cadastro/snapshot
 * depois que o documento já existia, deixando o snapshot congelado sem ele.
 */
export function preencherLacunasSnapshot(snapshot: ClienteSnapshot | undefined, clienteAtual: Cliente): ClienteSnapshot {
  const atual = clienteParaSnapshot(clienteAtual);
  if (!snapshot) return atual;
  const resultado = { ...snapshot } as Record<keyof ClienteSnapshot, unknown>;
  for (const chave of Object.keys(atual) as (keyof ClienteSnapshot)[]) {
    const valor = resultado[chave];
    if (valor === undefined || valor === null || valor === "") {
      resultado[chave] = atual[chave];
    }
  }
  return resultado as unknown as ClienteSnapshot;
}
