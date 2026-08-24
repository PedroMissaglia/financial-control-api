import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriasModule } from '../categorias/categorias.module';
import { ContasConjuntasModule } from '../contas-conjuntas/contas-conjuntas.module';
import { TransacoesModule } from '../transacoes/transacoes.module';
import { GastosMensaisController } from './gastos-mensais.controller';
import { GastosMensaisService } from './gastos-mensais.service';
import {
  GastoMensalPagamento,
  GastoMensalPagamentoSchema,
} from './schemas/gasto-mensal-pagamento.schema';
import { GastoMensal, GastoMensalSchema } from './schemas/gasto-mensal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GastoMensal.name, schema: GastoMensalSchema },
      { name: GastoMensalPagamento.name, schema: GastoMensalPagamentoSchema },
    ]),
    TransacoesModule,
    CategoriasModule,
    ContasConjuntasModule,
  ],
  controllers: [GastosMensaisController],
  providers: [GastosMensaisService],
})
export class GastosMensaisModule {}
