// Persistência real em arquivo JSON (dados sobrevivem a reinícios do servidor).
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { hashPassword } = require("./auth");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data.json");

const SUPER_ADMIN_EMAIL = "galdinomus@gmail.com";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "scfire2026";

function uid(prefix) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function seed() {
  const { salt, hash } = hashPassword(SUPER_ADMIN_PASSWORD);
  const admin = {
    id: uid("u"),
    email: SUPER_ADMIN_EMAIL,
    full_name: "Administrador SC Fire",
    salt,
    passwordHash: hash,
    status: "approved",
    onboarding_done: true,
    roles: ["admin", "user"],
    created_at: new Date().toISOString(),
  };
  return {
    users: [admin],
    sdrConfigs: {},
    whatsappInstances: [],
    crmCards: [],
    chats: [],
  };
}

let cache = null;

function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    cache = seed();
    save();
  }
  return cache;
}

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2));
}

module.exports = { load, save, uid, SUPER_ADMIN_EMAIL };
