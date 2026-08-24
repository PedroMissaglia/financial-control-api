import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyJsonTransform } from '../../common/mongoose-to-json';

export type CategoriaDocument = HydratedDocument<Categoria>;

@Schema({ collection: 'categorias' })
export class Categoria {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, index: true })
  usuarioId!: string;

  @Prop({ required: true })
  nome!: string;
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);
CategoriaSchema.index({ usuarioId: 1, nome: 1 }, { unique: true });
applyJsonTransform(CategoriaSchema);
