import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ContasConjuntasController } from './contas-conjuntas.controller';
import { ContasConjuntasService } from './contas-conjuntas.service';
import {
  ContaConjunta,
  ContaConjuntaSchema,
} from './schemas/conta-conjunta.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContaConjunta.name, schema: ContaConjuntaSchema },
    ]),
    UsuariosModule,
  ],
  controllers: [ContasConjuntasController],
  providers: [ContasConjuntasService],
  exports: [ContasConjuntasService],
})
export class ContasConjuntasModule {}
