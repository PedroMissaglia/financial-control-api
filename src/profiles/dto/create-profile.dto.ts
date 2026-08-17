import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProfileDto {
  @IsString()
  id!: string;

  @IsString()
  usuarioId!: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  themeMode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  metaEconomia?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  alertaGastos?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  transacoesPageSize?: number;

  @IsOptional()
  @IsObject()
  transacoesFiltros?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  extratoLimite?: number;

  @IsOptional()
  @IsArray()
  widgets?: unknown[];

  @IsOptional()
  @IsArray()
  layoutRows?: unknown[];

  @IsOptional()
  @IsArray()
  layoutGroups?: unknown[];
}
