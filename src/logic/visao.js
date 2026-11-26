export function visaoInicial(valorDaUrl, padrao) {
  if (valorDaUrl === '1') return true;
  if (valorDaUrl === '0') return false;
  return padrao;
}
