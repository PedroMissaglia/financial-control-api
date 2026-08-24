export const COMPETENCIA_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function competenciaAtualUtc(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function dataHojeSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function clampDataVencimento(competencia: string, dia: number): string {
  const [yearStr, monthStr] = competencia.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(Math.max(dia, 1), lastDay);
  return `${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`;
}
