import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyJsonTransform } from '../../common/mongoose-to-json';

export type ContaConjuntaStatus = 'pendente' | 'ativa';

export type ContaConjuntaDocument = HydratedDocument<ContaConjunta>;

@Schema({ collection: 'contas_conjuntas' })
export class ContaConjunta {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, enum: ['pendente', 'ativa'], index: true })
  status!: ContaConjuntaStatus;

  @Prop({ required: true, index: true })
  convidanteId!: string;

  @Prop({ required: true, index: true })
  convidadoId!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  convidadoEmail!: string;

  @Prop({ required: true })
  criadoEm!: string;

  @Prop({ type: String, default: null })
  aceitoEm!: string | null;
}

export const ContaConjuntaSchema = SchemaFactory.createForClass(ContaConjunta);
ContaConjuntaSchema.index({ convidanteId: 1, status: 1 });
ContaConjuntaSchema.index({ convidadoId: 1, status: 1 });
applyJsonTransform(ContaConjuntaSchema);
