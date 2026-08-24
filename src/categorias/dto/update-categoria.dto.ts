import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

function trimString({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

export class UpdateCategoriaDto {
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  nome!: string;
}
