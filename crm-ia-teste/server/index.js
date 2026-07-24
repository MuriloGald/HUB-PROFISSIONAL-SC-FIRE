// Servidor real do SC Fire CRM (teste) — autenticação (login/senha) + dados persistentes.
// Node + Express. Convenção de resposta: HTTP 200 com { ok, data, error }.
const express = require("express");
const cors = require("cors");
const { load, save, uid, SUPER_ADMIN_EMAIL } = require("./db");
const { hashPassword, verifyPassword, signToken, verifyToken } = require("./auth");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;

const ok = (res, data) => res.json({ ok: true, data, error: null });
const fail = (res, error) => res.json({ ok: false, data: null, error });

// ---- helpers ----
function publicProfile(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    status: u.status,
    onboarding_done: u.onboarding_done,
    created_at: u.created_at,
  };
}
function userFromReq(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const userId = verifyToken(token);
  if (!userId) return null;
  return load().users.find((u) => u.id === userId) || null;
}
function requireAuth(req, res, next) {
  const u = userFromReq(req);
  if (!u) return fail(res, "Não autenticado");
  req.user = u;
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user.roles.includes("admin")) return fail(res, "Acesso restrito ao administrador");
  next();
}
function defaultSdrConfig(userId) {
  return {
    id: uid("sdr"),
    user_id: userId,
    agent_name: "Sofia",
    company_context: "",
    products: "",
    qualification_criteria: "",
    communication_style: "",
    handoff_rules: "",
    enabled: true,
  };
}

// ======================= AUTH =======================
app.post("/api/auth/register", (req, res) => {
  const db = load();
  const { email, password, fullName } = req.body || {};
  if (!email || !password) return fail(res, "Informe e-mail e senha.");
  if (String(password).length < 6) return fail(res, "Password should be at least 6 characters");
  if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
    return fail(res, "User already registered");

  const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const { salt, hash } = hashPassword(password);
  const user = {
    id: uid("u"),
    email,
    full_name: fullName || "",
    salt,
    passwordHash: hash,
    status: isSuperAdmin ? "approved" : "pending",
    onboarding_done: false,
    roles: isSuperAdmin ? ["admin", "user"] : ["user"],
    created_at: new Date().toISOString(),
  };
  db.users.push(user);
  save();
  ok(res, { token: signToken(user.id), user: { id: user.id, email: user.email } });
});

app.post("/api/auth/login", (req, res) => {
  const db = load();
  const { email, password } = req.body || {};
  const user = db.users.find((u) => u.email.toLowerCase() === String(email || "").toLowerCase());
  if (!user || !verifyPassword(password || "", user.salt, user.passwordHash))
    return fail(res, "Invalid login credentials");
  ok(res, { token: signToken(user.id), user: { id: user.id, email: user.email } });
});

app.get("/api/auth/session", requireAuth, (req, res) => {
  ok(res, { id: req.user.id, email: req.user.email });
});

// ======================= PROFILE / ROLES =======================
app.get("/api/profile", requireAuth, (req, res) => ok(res, publicProfile(req.user)));

app.get("/api/roles/has", requireAuth, (req, res) => {
  const role = String(req.query.role || "");
  ok(res, req.user.roles.includes(role));
});

app.patch("/api/profile", requireAuth, (req, res) => {
  req.user.full_name = String(req.body?.fullName ?? req.user.full_name);
  save();
  ok(res, publicProfile(req.user));
});

app.patch("/api/profile/password", requireAuth, (req, res) => {
  const { current, next } = req.body || {};
  if (!verifyPassword(current || "", req.user.salt, req.user.passwordHash))
    return fail(res, "Senha atual incorreta.");
  if (String(next || "").length < 6) return fail(res, "Password should be at least 6 characters");
  const { salt, hash } = hashPassword(next);
  req.user.salt = salt;
  req.user.passwordHash = hash;
  save();
  ok(res, { changed: true });
});

app.post("/api/onboarding/complete", requireAuth, (req, res) => {
  req.user.onboarding_done = true;
  save();
  ok(res, { done: true });
});

// ======================= ADMIN =======================
app.get("/api/admin/pending", requireAuth, requireAdmin, (req, res) => {
  ok(res, load().users.filter((u) => u.status === "pending").map(publicProfile));
});
app.post("/api/admin/approve", requireAuth, requireAdmin, (req, res) => {
  const u = load().users.find((x) => x.id === req.body?.userId);
  if (u) { u.status = "approved"; save(); }
  ok(res, { ok: true });
});
app.post("/api/admin/block", requireAuth, requireAdmin, (req, res) => {
  const u = load().users.find((x) => x.id === req.body?.userId);
  if (u) { u.status = "blocked"; save(); }
  ok(res, { ok: true });
});

// ======================= SDR CONFIG =======================
app.get("/api/sdr-config", requireAuth, (req, res) => {
  const db = load();
  if (!db.sdrConfigs[req.user.id]) {
    db.sdrConfigs[req.user.id] = defaultSdrConfig(req.user.id);
    save();
  }
  ok(res, db.sdrConfigs[req.user.id]);
});
app.put("/api/sdr-config", requireAuth, (req, res) => {
  const db = load();
  db.sdrConfigs[req.user.id] = { ...req.body, user_id: req.user.id };
  save();
  ok(res, db.sdrConfigs[req.user.id]);
});

// ======================= WHATSAPP =======================
app.get("/api/whatsapp/instances", requireAuth, (req, res) => {
  ok(res, load().whatsappInstances.filter((i) => i.user_id === req.user.id));
});
app.post("/api/whatsapp/instances", requireAuth, (req, res) => {
  const db = load();
  const inst = {
    id: uid("wa"),
    user_id: req.user.id,
    name: String(req.body?.name || "Instância"),
    phone: null,
    status: "disconnected",
    created_at: new Date().toISOString(),
  };
  db.whatsappInstances.push(inst);
  save();
  ok(res, inst);
});
app.post("/api/whatsapp/instances/:id/connect", requireAuth, (req, res) => {
  const db = load();
  const inst = db.whatsappInstances.find((i) => i.id === req.params.id && i.user_id === req.user.id);
  if (!inst) return fail(res, "Instância não encontrada");
  inst.status = "connected";
  inst.phone = inst.phone || "+5511900000000";
  save();
  ok(res, inst);
});

// ======================= CRM =======================
app.get("/api/crm/cards", requireAuth, (req, res) => {
  ok(res, load().crmCards.filter((c) => c.user_id === req.user.id));
});
app.post("/api/crm/cards", requireAuth, (req, res) => {
  const db = load();
  const card = {
    id: uid("c"),
    user_id: req.user.id,
    lead_name: String(req.body?.lead_name || "Novo lead"),
    phone: String(req.body?.phone || ""),
    stage: req.body?.stage || "conversas",
    last_message: String(req.body?.last_message || ""),
    updated_at: new Date().toISOString(),
  };
  db.crmCards.push(card);
  save();
  ok(res, card);
});
app.patch("/api/crm/cards/:id", requireAuth, (req, res) => {
  const db = load();
  const card = db.crmCards.find((c) => c.id === req.params.id && c.user_id === req.user.id);
  if (card) {
    if (req.body?.stage) card.stage = req.body.stage;
    card.updated_at = new Date().toISOString();
    save();
  }
  ok(res, { ok: true });
});

// ======================= CHATS =======================
app.get("/api/chats", requireAuth, (req, res) => {
  ok(res, load().chats.filter((c) => c.user_id === req.user.id));
});

app.get("/api/health", (req, res) => ok(res, { status: "up" }));

app.listen(PORT, () => {
  load(); // garante seed
  console.log(`[SC Fire] Servidor real rodando em http://localhost:${PORT}`);
  console.log(`[SC Fire] Conta oficial: ${SUPER_ADMIN_EMAIL}`);
});
