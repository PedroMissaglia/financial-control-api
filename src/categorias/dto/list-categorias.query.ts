import { IsString, MinLength } from 'class-validator';

export class ListCategoriasQuery {
  @IsString()
  @MinLength(1)
  usuarioId!: string;
}
