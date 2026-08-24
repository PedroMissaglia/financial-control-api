import { Type, Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { FORMAS_PAGAMENTO } from '../../transacoes/transacao.constants';
import type { FormaPagamento } from '../../transacoes/transacao.constants';

function trimString({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateGastoMensalDto {
  @IsString()
  @MinLength(1)
  usuarioId!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  titulo!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(240)
  descricao?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  diaVencimento!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valor!: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  categoria?: string;

  @IsOptional()
  @IsIn(FORMAS_PAGAMENTO)
  formaPagamento?: FormaPagamento | null;
}
