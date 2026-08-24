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
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { resolveRequestedUsuarioIds } from '../common/usuario-ids';
import { ContasConjuntasService } from '../contas-conjuntas/contas-conjuntas.service';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { ListTransacoesQuery } from './dto/list-transacoes.query';
import { TransacoesService } from './transacoes.service';

@Controller('transacoes')
export class TransacoesController {
  constructor(
    private readonly transacoesService: TransacoesService,
    private readonly contasConjuntasService: ContasConjuntasService,
  ) {}

  @Get()
  async findAll(@Query() query: ListTransacoesQuery, @CurrentUser() user: AuthUser) {
    const ids = resolveRequestedUsuarioIds(query.usuarioId, query.usuarioIds);
    if (ids.length) {
      await this.contasConjuntasService.assertCanAccessAll(user.id, ids);
    }
    return this.transacoesService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const transacao = (await this.transacoesService.findById(id)) as { usuarioId: string };
    await this.contasConjuntasService.assertCanAccess(user.id, transacao.usuarioId);
    return transacao;
  }

  @Post()
  async create(@Body() dto: CreateTransacaoDto, @CurrentUser() user: AuthUser) {
    await this.contasConjuntasService.assertCanAccess(user.id, dto.usuarioId);
    return this.transacoesService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: CreateTransacaoDto,
    @CurrentUser() user: AuthUser,
  ) {
    await this.contasConjuntasService.assertCanAccess(user.id, dto.usuarioId);
    return this.transacoesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const transacao = (await this.transacoesService.findById(id)) as { usuarioId: string };
    await this.contasConjuntasService.assertCanAccess(user.id, transacao.usuarioId);
    return this.transacoesService.remove(id);
  }
}
