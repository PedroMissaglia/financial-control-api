import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyJsonTransform } from '../../common/mongoose-to-json';

export type GastoMensalPagamentoDocument = HydratedDocument<GastoMensalPagamento>;

@Schema({ collection: 'gastos_mensais_pagamentos' })
export class GastoMensalPagamento {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, index: true })
  usuarioId!: string;

  @Prop({ required: true, index: true })
  gastoId!: string;

  @Prop({ required: true })
  competencia!: string;

  @Prop({ required: true })
  transacaoId!: string;
}

export const GastoMensalPagamentoSchema =
  SchemaFactory.createForClass(GastoMensalPagamento);
GastoMensalPagamentoSchema.index(
  { usuarioId: 1, gastoId: 1, competencia: 1 },
  { unique: true },
);
applyJsonTransform(GastoMensalPagamentoSchema);
