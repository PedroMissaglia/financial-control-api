import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { ListTransacoesQuery } from './dto/list-transacoes.query';
import { TransacoesService } from './transacoes.service';

@Controller('transacoes')
export class TransacoesController {
  constructor(private readonly transacoesService: TransacoesService) {}

  @Get()
  findAll(@Query() query: ListTransacoesQuery) {
    return this.transacoesService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.transacoesService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateTransacaoDto) {
    return this.transacoesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateTransacaoDto) {
    return this.transacoesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transacoesService.remove(id);
  }
}
