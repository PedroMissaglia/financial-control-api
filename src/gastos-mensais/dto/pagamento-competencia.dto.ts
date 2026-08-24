import { IsString, Matches } from 'class-validator';
import { COMPETENCIA_REGEX } from '../gastos-mensais.helpers';

export class PagamentoCompetenciaDto {
  @IsString()
  @Matches(COMPETENCIA_REGEX, { message: 'Competência inválida' })
  competencia!: string;
}
