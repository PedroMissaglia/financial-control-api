import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyJsonTransform } from '../../common/mongoose-to-json';
import type { FormaPagamento, TipoTransacao } from '../transacao.constants';

export type TransacaoDocument = HydratedDocument<Transacao>;

@Schema({ collection: 'transacoes' })
export class Transacao {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, index: true })
  usuarioId!: string;

  @Prop({ required: true, type: String })
  tipo!: TipoTransacao;

  @Prop({ required: true })
  valor!: number;

  @Prop({ required: true })
  data!: string;

  @Prop({ type: String })
  hora?: string;

  @Prop({ required: true })
  descricao!: string;

  @Prop({ required: true, type: String })
  categoria!: string;

  @Prop({ type: String, default: null })
  formaPagamento!: FormaPagamento | null;

  @Prop({ type: String, default: null })
  anexoId!: string | null;
}

export const TransacaoSchema = SchemaFactory.createForClass(Transacao);
TransacaoSchema.index({ usuarioId: 1, data: -1, hora: -1 });
applyJsonTransform(TransacaoSchema, [], (ret) => {
  if (!ret.hora) ret.hora = '00:00:00';
  if (ret.formaPagamento == null) ret.formaPagamento = null;
  if (ret.anexoId == null) ret.anexoId = null;
  delete ret.anexo;
  delete ret.dataUrl;
});
