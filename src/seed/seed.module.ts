import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Anexo, AnexoSchema } from '../anexos/schemas/anexo.schema';
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
      { name: Anexo.name, schema: AnexoSchema },
      { name: Profile.name, schema: ProfileSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
