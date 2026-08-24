import { Transform } from 'class-transformer';
import { IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { parseUsuarioIdsQuery } from '../../common/usuario-ids';

export class ListCategoriasQuery {
  @ValidateIf((query: ListCategoriasQuery) => !query.usuarioIds?.length)
  @IsString()
  @MinLength(1)
  usuarioId?: string;

  @IsOptional()
  @Transform(({ value }) => parseUsuarioIdsQuery(value))
  @IsString({ each: true })
  usuarioIds?: string[];
}
