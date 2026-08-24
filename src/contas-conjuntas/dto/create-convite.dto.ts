import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

function trimLower({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class CreateConviteDto {
  @Transform(trimLower)
  @IsEmail()
  email!: string;
}
