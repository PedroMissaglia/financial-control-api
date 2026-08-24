import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyJsonTransform } from '../../common/mongoose-to-json';

export type AnexoDocument = HydratedDocument<Anexo>;

@Schema({ collection: 'anexos' })
export class Anexo {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, unique: true, index: true })
  transacaoId!: string;

  @Prop({ required: true, index: true })
  usuarioId!: string;

  @Prop({ required: true })
  nome!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  dataUrl!: string;
}

export const AnexoSchema = SchemaFactory.createForClass(Anexo);
applyJsonTransform(AnexoSchema);
