import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  CATEGORIAS_TRANSACAO,
  TIPOS_TRANSACAO,
} from '../transacao.constants';
import type {
  CategoriaTransacao,
  TipoTransacao,
} from '../transacao.constants';

export class AnexoDto {
  @IsString()
  nome!: string;

  @IsString()
  mimeType!: string;

  @IsString()
  dataUrl!: string;
}

export class CreateTransacaoDto {
  @IsString()
  usuarioId!: string;

  @IsIn(TIPOS_TRANSACAO)
  tipo!: TipoTransacao;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valor!: number;

  @IsString()
  data!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
    message: 'hora deve estar no formato HH:mm:ss',
  })
  hora!: string;

  @IsString()
  @MinLength(1)
  descricao!: string;

  @IsIn(CATEGORIAS_TRANSACAO)
  categoria!: CategoriaTransacao;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @ValidateNested()
  @Type(() => AnexoDto)
  @IsOptional()
  anexo?: AnexoDto | null;
}
