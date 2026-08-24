export type ContaConjuntaStatusView =
  | 'nenhuma'
  | 'convite_enviado'
  | 'convite_recebido'
  | 'ativa';

export type ContaConjuntaParceiro = {
  id: string;
  nome: string;
  email: string;
};

export type ContaConjuntaConvite = {
  id: string;
  email: string;
  criadoEm: string;
};

export type ContaConjuntaView = {
  status: ContaConjuntaStatusView;
  parceiro: ContaConjuntaParceiro | null;
  convite: ContaConjuntaConvite | null;
};

export const CONTA_CONJUNTA_VAZIA: ContaConjuntaView = {
  status: 'nenhuma',
  parceiro: null,
  convite: null,
};
