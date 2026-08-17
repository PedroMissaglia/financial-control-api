import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applyJsonTransform } from '../../common/mongoose-to-json';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ collection: 'profiles', strict: false })
export class Profile {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, index: true })
  usuarioId!: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
applyJsonTransform(ProfileSchema);
