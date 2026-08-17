import { Schema } from 'mongoose';

export function applyJsonTransform(
  schema: Schema,
  hidden: string[] = [],
  extra?: (ret: Record<string, unknown>) => void,
): void {
  schema.set('toJSON', {
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret._id;
      for (const key of hidden) {
        delete ret[key];
      }
      extra?.(ret);
      return ret;
    },
  });
}
