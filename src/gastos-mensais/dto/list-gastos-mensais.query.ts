import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator';
import { parseUsuarioIdsQuery } from '../../common/usuario-ids';
import { COMPETENCIA_REGEX } from '../gastos-mensais.helpers';

function emptyToUndefined({ value }: { value: unknown }) {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
}

export class ListGastosMensaisQuery {
  @ValidateIf((query: ListGastosMensaisQuery) => !query.usuarioIds?.length)
  @IsString()
  @MinLength(1)
  usuarioId?: string;

  @IsOptional()
  @Transform(({ value }) => parseUsuarioIdsQuery(value))
  @IsString({ each: true })
  usuarioIds?: string[];

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @Matches(COMPETENCIA_REGEX, { message: 'Competência inválida' })
  competencia?: string;
}
