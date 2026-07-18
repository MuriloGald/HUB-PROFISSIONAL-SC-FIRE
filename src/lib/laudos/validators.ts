/**
 * Validadores de documentos do modulo de Laudos de Eventos.
 * Porte de js/utils/validators.js do app legado Laudos_de_eventos_SCFire.
 */

export function validarCPF(cpfInput: string): boolean {
  const cpf = cpfInput.replace(/[^\d]+/g, "");
  if (cpf === "") return false;

  if (
    cpf.length !== 11 ||
    [
      "00000000000", "11111111111", "22222222222", "33333333333", "44444444444",
      "55555555555", "66666666666", "77777777777", "88888888888", "99999999999",
    ].includes(cpf)
  ) {
    return false;
  }

  let add = 0;
  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;

  add = 0;
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;

  return true;
}

export function validarCNPJ(cnpjInput: string): boolean {
  const cnpj = cnpjInput.replace(/[^\d]+/g, "");
  if (cnpj === "") return false;
  if (cnpj.length !== 14) return false;

  if (
    [
      "00000000000000", "11111111111111", "22222222222222", "33333333333333", "44444444444444",
      "55555555555555", "66666666666666", "77777777777777", "88888888888888", "99999999999999",
    ].includes(cnpj)
  ) {
    return false;
  }

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== Number(digitos.charAt(0))) return false;

  tamanho += 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += Number(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== Number(digitos.charAt(1))) return false;

  return true;
}

export function validarEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
