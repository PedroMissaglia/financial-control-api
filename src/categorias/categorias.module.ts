import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContasConjuntasModule } from '../contas-conjuntas/contas-conjuntas.module';
import {
  Transacao,
  TransacaoSchema,
} from '../transacoes/schemas/transacao.schema';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { Categoria, CategoriaSchema } from './schemas/categoria.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Categoria.name, schema: CategoriaSchema },
      { name: Transacao.name, schema: TransacaoSchema },
    ]),
    ContasConjuntasModule,
  ],
  controllers: [CategoriasController],
  providers: [CategoriasService],
  exports: [CategoriasService],
})
export class CategoriasModule {}
