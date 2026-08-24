import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';
import { COMPETENCIA_REGEX } from '../gastos-mensais.helpers';

function emptyToUndefined({ value }: { value: unknown }) {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
}

export class DeletePagamentoQuery {
  @Transform(emptyToUndefined)
  @IsString()
  @Matches(COMPETENCIA_REGEX, { message: 'Competência inválida' })
  competencia!: string;
}
