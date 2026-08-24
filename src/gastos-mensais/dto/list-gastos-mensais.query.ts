import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { COMPETENCIA_REGEX } from '../gastos-mensais.helpers';

function emptyToUndefined({ value }: { value: unknown }) {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
}

export class ListGastosMensaisQuery {
  @IsString()
  @MinLength(1)
  usuarioId!: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @Matches(COMPETENCIA_REGEX, { message: 'Competência inválida' })
  competencia?: string;
}
