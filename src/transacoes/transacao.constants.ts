export const TIPOS_TRANSACAO = [
  'deposito',
  'transferencia',
  'saque',
  'pagamento',
] as const;

export type TipoTransacao = (typeof TIPOS_TRANSACAO)[number];

export const CATEGORIAS_TRANSACAO = [
  'salario',
  'freelance',
  'moradia',
  'alimentacao',
  'transporte',
  'saude',
  'educacao',
  'lazer',
  'servicos',
  'transferencias',
  'outros',
] as const;

export type CategoriaTransacao = (typeof CATEGORIAS_TRANSACAO)[number];
