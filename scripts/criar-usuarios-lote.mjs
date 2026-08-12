/**
 * Cria varias contas no Supabase Auth de uma vez (diretor/administrador/professor),
 * usando a mesma API que a tela de Usuarios usa uma conta por vez
 * (src/app/actions/usuarios.ts -> admin.auth.admin.createUser).
 *
 * Nao existe "senha em lote via SQL" no Supabase: a senha fica em auth.users/
 * auth.identities (hash gerenciado pelo GoTrue), inserir ali direto por SQL
 * nao e suportado. Isso aqui faz o equivalente com a Admin API, em lote.
 *
 * Uso:
 *   node scripts/criar-usuarios-lote.mjs caminho/para/usuarios.csv
 *
 * O CSV precisa ter cabecalho exato (nessa ordem), separado por virgula:
 *   email,full_name,role,senha
 * role e um de: diretor | administrador | professor
 * senha precisa ter no minimo 6 caracteres.
 *
 * Exemplo de arquivo:
 *   email,full_name,role,senha
 *   maria@exemplo.com,Maria Silva,professor,TrocarDepois123
 *   joao@exemplo.com,Joao Souza,administrador,TrocarDepois123
 *
 * Pede a SUPABASE_SERVICE_ROLE_KEY no terminal se ela nao estiver em
 * .env.local (nao fica salva em lugar nenhum). Essa key da acesso total
 * ao banco — rode isso só localmente, nunca cole a key em outro lugar.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROLES_VALIDOS = ["diretor", "administrador", "professor"];

function lerEnvLocal() {
  try {
    const conteudo = readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8");
    const vars = {};
    for (const linha of conteudo.split("\n")) {
      const match = linha.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) vars[match[1]] = match[2].trim();
    }
    return vars;
  } catch {
    return {};
  }
}

function parseCsv(caminho) {
  const conteudo = readFileSync(caminho, "utf-8").trim();
  const linhas = conteudo.split("\n").map((l) => l.trim()).filter(Boolean);
  const cabecalho = linhas[0].split(",").map((c) => c.trim());
  const esperado = ["email", "full_name", "role", "senha"];
  if (cabecalho.join(",") !== esperado.join(",")) {
    throw new Error(`Cabeçalho do CSV precisa ser exatamente: ${esperado.join(",")} (achei: ${cabecalho.join(",")})`);
  }

  return linhas.slice(1).map((linha, i) => {
    const [email, full_name, role, senha] = linha.split(",").map((c) => c.trim());
    const numeroLinha = i + 2; // +1 pelo header, +1 porque humano conta desde 1
    if (!email || !full_name || !role || !senha) {
      throw new Error(`Linha ${numeroLinha}: faltam campos (email/full_name/role/senha).`);
    }
    if (!ROLES_VALIDOS.includes(role)) {
      throw new Error(`Linha ${numeroLinha}: role "${role}" inválido — use ${ROLES_VALIDOS.join(" | ")}.`);
    }
    if (senha.length < 6) {
      throw new Error(`Linha ${numeroLinha}: senha precisa ter no mínimo 6 caracteres.`);
    }
    return { email, full_name, role, senha, numeroLinha };
  });
}

async function main() {
  const caminhoCsv = process.argv[2];
  if (!caminhoCsv) {
    console.error("Uso: node scripts/criar-usuarios-lote.mjs caminho/para/usuarios.csv");
    process.exit(1);
  }

  const usuarios = parseCsv(caminhoCsv);
  console.log(`${usuarios.length} usuário(s) encontrado(s) no CSV.\n`);

  const env = lerEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  let serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.error("NEXT_PUBLIC_SUPABASE_URL não encontrada em .env.local nem nas variáveis de ambiente.");
    process.exit(1);
  }

  if (!serviceKey) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    serviceKey = (await rl.question("Cole a SUPABASE_SERVICE_ROLE_KEY (não fica salva): ")).trim();
    rl.close();
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  let sucesso = 0;
  let falhas = 0;

  for (const u of usuarios) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.senha,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    });

    if (createError || !created.user) {
      console.error(`✗ Linha ${u.numeroLinha} (${u.email}): ${createError?.message ?? "erro desconhecido ao criar"}`);
      falhas++;
      continue;
    }

    // A linha em profiles já nasce via trigger (role "professor" por padrão) —
    // aqui ajustamos pro papel definido no CSV, igual criarUsuario() faz.
    const { error: roleError } = await admin
      .from("profiles")
      .update({ role: u.role, full_name: u.full_name })
      .eq("id", created.user.id);

    if (roleError) {
      console.error(`✗ Linha ${u.numeroLinha} (${u.email}): conta criada, mas falhou ao definir o papel — ${roleError.message}`);
      falhas++;
      continue;
    }

    console.log(`✓ ${u.email} — ${u.role}`);
    sucesso++;
  }

  console.log(`\nConcluído: ${sucesso} criado(s), ${falhas} com erro.`);
}

main();
