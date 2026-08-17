import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyJsonTransform } from '../../common/mongoose-to-json';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ collection: 'refresh_tokens' })
export class RefreshToken {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, index: true })
  usuarioId!: string;

  @Prop({ required: true, unique: true })
  tokenHash!: string;

  @Prop({ type: Date, required: true, expires: 0 })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  revokedAt!: Date | null;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
applyJsonTransform(RefreshTokenSchema);
