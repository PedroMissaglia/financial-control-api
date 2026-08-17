import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  CATEGORIAS_TRANSACAO,
  TIPOS_TRANSACAO,
} from '../transacao.constants';
import type {
  CategoriaTransacao,
  TipoTransacao,
} from '../transacao.constants';

function emptyToUndefined({ value }: { value: unknown }) {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
}

function toOptionalNumber({ value }: { value: unknown }) {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export class ListTransacoesQuery {
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  busca?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsIn(TIPOS_TRANSACAO)
  tipo?: TipoTransacao;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsIn(CATEGORIAS_TRANSACAO)
  categoria?: CategoriaTransacao;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  dataInicio?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  dataFim?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  valorMin?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  valorMax?: number;
}
