import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyJsonTransform } from '../../common/mongoose-to-json';
import type { FormaPagamento } from '../../transacoes/transacao.constants';

export type GastoMensalDocument = HydratedDocument<GastoMensal>;

@Schema({ collection: 'gastos_mensais' })
export class GastoMensal {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, index: true })
  usuarioId!: string;

  @Prop({ required: true })
  titulo!: string;

  @Prop({ type: String, default: '' })
  descricao!: string;

  @Prop({ required: true })
  diaVencimento!: number;

  @Prop({ required: true })
  valor!: number;

  @Prop({ required: true, type: String, default: 'outros' })
  categoria!: string;

  @Prop({ type: String, default: null })
  formaPagamento!: FormaPagamento | null;
}

export const GastoMensalSchema = SchemaFactory.createForClass(GastoMensal);
GastoMensalSchema.index({ usuarioId: 1 });
applyJsonTransform(GastoMensalSchema, [], (ret) => {
  if (ret.descricao == null) ret.descricao = '';
  if (ret.formaPagamento == null) ret.formaPagamento = null;
});
