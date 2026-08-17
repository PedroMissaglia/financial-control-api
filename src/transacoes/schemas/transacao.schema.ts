import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyJsonTransform } from '../../common/mongoose-to-json';
import type { CategoriaTransacao, TipoTransacao } from '../transacao.constants';

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
  categoria!: CategoriaTransacao;

  @Prop({
    type: {
      nome: { type: String, required: true },
      mimeType: { type: String, required: true },
      dataUrl: { type: String, required: true },
    },
    default: null,
  })
  anexo!: { nome: string; mimeType: string; dataUrl: string } | null;
}

export const TransacaoSchema = SchemaFactory.createForClass(Transacao);
TransacaoSchema.index({ usuarioId: 1, data: -1, hora: -1 });
applyJsonTransform(TransacaoSchema, [], (ret) => {
  if (!ret.hora) ret.hora = '00:00:00';
});
