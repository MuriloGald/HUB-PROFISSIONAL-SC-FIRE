/**
 * Mascaras de formatacao para os formularios do modulo de Laudos de Eventos.
 * Porte de js/utils/formatters.js do app legado Laudos_de_eventos_SCFire,
 * adaptado para uso em inputs controlados (onChange) em vez de manipulacao de DOM.
 */

export function formatCPF(value: string): string {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

export function formatCNPJ(value: string): string {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

export function formatCpfCnpj(value: string): string {
  const raw = value.replace(/\D/g, "");
  if (raw.length <= 11) return formatCPF(raw);
  return formatCNPJ(raw);
}

export function formatCEP(value: string): string {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
}

export function formatPhone(value: string): string {
  if (!value) return "";
  const raw = value.replace(/\D/g, "");
  if (raw.length <= 10) {
    return raw
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  }
  return raw
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}
