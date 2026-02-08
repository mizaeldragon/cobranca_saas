export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidCpf(input: string) {
  const cpf = onlyDigits(input);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(cpf[i]) * (11 - i);
  }
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  return check === Number(cpf[10]);
}

export function isValidCnpj(input: string) {
  const cnpj = onlyDigits(input);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(cnpj[i]) * weights1[i];
  }
  let mod = sum % 11;
  const check1 = mod < 2 ? 0 : 11 - mod;
  if (check1 !== Number(cnpj[12])) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += Number(cnpj[i]) * weights2[i];
  }
  mod = sum % 11;
  const check2 = mod < 2 ? 0 : 11 - mod;
  return check2 === Number(cnpj[13]);
}

export function isValidCpfCnpj(input: string) {
  const digits = onlyDigits(input);
  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return isValidCnpj(digits);
  return false;
}
