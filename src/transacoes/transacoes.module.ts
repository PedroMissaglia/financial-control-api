import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnexosModule } from '../anexos/anexos.module';
import { CategoriasModule } from '../categorias/categorias.module';
import { ContasConjuntasModule } from '../contas-conjuntas/contas-conjuntas.module';
import { Transacao, TransacaoSchema } from './schemas/transacao.schema';
import { TransacoesController } from './transacoes.controller';
import { TransacoesService } from './transacoes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transacao.name, schema: TransacaoSchema },
    ]),
    CategoriasModule,
    AnexosModule,
    ContasConjuntasModule,
  ],
  controllers: [TransacoesController],
  providers: [TransacoesService],
  exports: [TransacoesService],
})
export class TransacoesModule {}
