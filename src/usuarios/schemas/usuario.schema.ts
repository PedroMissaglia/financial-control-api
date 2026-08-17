import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyJsonTransform } from '../../common/mongoose-to-json';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ collection: 'usuarios' })
export class Usuario {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  nome!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, select: false })
  senha!: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
applyJsonTransform(UsuarioSchema, ['senha']);
