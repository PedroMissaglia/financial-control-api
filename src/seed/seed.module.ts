import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from '../profiles/schemas/profile.schema';
import {
  Transacao,
  TransacaoSchema,
} from '../transacoes/schemas/transacao.schema';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Transacao.name, schema: TransacaoSchema },
      { name: Profile.name, schema: ProfileSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
