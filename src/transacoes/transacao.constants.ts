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

export const CATEGORIAS_SISTEMA: Record<CategoriaTransacao, string> = {
  salario: 'Salário',
  freelance: 'Freelance',
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  saude: 'Saúde',
  educacao: 'Educação',
  lazer: 'Lazer',
  servicos: 'Serviços',
  transferencias: 'Transferências',
  outros: 'Outros',
};

export const FORMAS_PAGAMENTO = ['credito', 'debito', 'pix', 'vr_va'] as const;
export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];
