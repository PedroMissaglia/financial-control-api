import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnexosController } from './anexos.controller';
import { AnexosService } from './anexos.service';
import { Anexo, AnexoSchema } from './schemas/anexo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Anexo.name, schema: AnexoSchema }]),
  ],
  controllers: [AnexosController],
  providers: [AnexosService],
  exports: [AnexosService],
})
export class AnexosModule {}
