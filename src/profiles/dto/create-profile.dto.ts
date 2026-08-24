import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class DashboardWidgetDto {
  @IsString()
  id!: string;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cols?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  colStart?: number;
}

export class LayoutRowDto {
  @IsIn(['full', 'group'])
  type!: 'full' | 'group';

  @IsOptional()
  @IsString()
  widgetId?: string;

  @IsOptional()
  @IsString()
  groupId?: string;
}

export class LayoutGroupDto {
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  left!: string[];

  @IsArray()
  @IsString({ each: true })
  center!: string[];

  @IsArray()
  @IsString({ each: true })
  right!: string[];
}

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
  @ValidateNested({ each: true })
  @Type(() => DashboardWidgetDto)
  widgets?: DashboardWidgetDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LayoutRowDto)
  layoutRows?: LayoutRowDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LayoutGroupDto)
  layoutGroups?: LayoutGroupDto[];
}
