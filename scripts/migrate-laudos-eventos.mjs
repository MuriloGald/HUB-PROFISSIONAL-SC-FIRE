/**
 * Migra os clientes e eventos do app legado Laudos_de_eventos_SCFire
 * (hoje em Google Sheets via Apps Script) para as tabelas `clientes` e
 * `laudos` do Supabase do Hub.
 *
 * Uso:
 *   node scripts/migrate-laudos-eventos.mjs
 *
 * Pede seu e-mail/senha de login do Hub no terminal (nao fica salvo em
 * lugar nenhum) — as policies de RLS liberam insert/update para qualquer
 * usuario autenticado, entao a chave anon + login e suficiente, sem
 * precisar de service role key.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function lerEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const conteudo = readFileSync(envPath, "utf-8");
  const vars = {};
  for (const linha of conteudo.split("\n")) {
    const match = linha.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) vars[match[1]] = match[2].trim();
  }
  return vars;
}

async function perguntar(rl, texto) {
  const resposta = await rl.question(texto);
  return resposta.trim();
}

async function main() {
  const env = lerEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrados em .env.local");
  }

  const legado = JSON.parse(readFileSync(path.join(__dirname, "legacy-laudos-data.json"), "utf-8"));

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const email = await perguntar(rl, "E-mail de login do Hub: ");
  const senha = await perguntar(rl, "Senha: ");
  rl.close();

  const supabase = createClient(url, anonKey);
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (authError) throw new Error(`Falha no login: ${authError.message}`);
  console.log("Login OK.");

  const idMap = {}; // id legado -> uuid novo

  console.log(`\nInserindo ${legado.clientes.length} clientes...`);
  for (const c of legado.clientes) {
    const payload = {
      nome: c.razao_social,
      razao_social: c.razao_social,
      cnpj_cpf: c.cnpj || c.cpf || null,
      tipo: "evento",
      responsavel_nome: c.nome_responsavel,
      email: c.email || null,
      telefone: c.telefone || null,
      endereco: `${c.logradouro}, ${c.numero}`,
      logradouro: c.logradouro,
      numero: c.numero,
      bairro: c.bairro,
      complemento: c.complemento || null,
      cidade: c.cidade,
      estado: c.estado,
      cep: c.cep,
      created_at: c.created_at,
    };

    const { data, error } = await supabase.from("clientes").insert(payload).select().single();
    if (error) throw new Error(`Erro ao inserir cliente "${c.razao_social}": ${error.message}`);
    idMap[c.id] = data.id;
    console.log(`  OK: ${c.razao_social} -> ${data.id}`);
  }

  console.log(`\nInserindo ${legado.eventos.length} eventos como laudos (IN24)...`);
  for (const e of legado.eventos) {
    const novoClienteId = idMap[e.cliente_id];
    if (!novoClienteId) {
      console.warn(`  AVISO: cliente_id "${e.cliente_id}" não encontrado no mapa — pulando evento "${e.nome_evento}"`);
      continue;
    }

    const dados = {
      ...e,
      cliente_id: novoClienteId,
      cliente: e.cliente ? { ...e.cliente, id: novoClienteId } : undefined,
    };
    delete dados.id; // id legado nao deve ir para o jsonb como se fosse o id do laudo

    const payload = {
      cliente_id: novoClienteId,
      tipo_documento: "IN24",
      status: "concluido",
      dados,
      created_at: e.created_at,
      updated_at: e.updated_at || e.created_at,
    };

    const { data, error } = await supabase.from("laudos").insert(payload).select().single();
    if (error) throw new Error(`Erro ao inserir evento "${e.nome_evento}" (${e.codigo}): ${error.message}`);
    console.log(`  OK: ${e.codigo} - ${e.nome_evento} -> ${data.id}`);
  }

  console.log("\nMigração concluída.");
}

main().catch((err) => {
  console.error("\nErro na migração:", err.message);
  process.exit(1);
});
