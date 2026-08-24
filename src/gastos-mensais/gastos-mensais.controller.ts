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
import { CreateGastoMensalDto } from './dto/create-gasto-mensal.dto';
import { DeletePagamentoQuery } from './dto/delete-pagamento.query';
import { ListGastosMensaisQuery } from './dto/list-gastos-mensais.query';
import { PagamentoCompetenciaDto } from './dto/pagamento-competencia.dto';
import { UpdateGastoMensalDto } from './dto/update-gasto-mensal.dto';
import { GastosMensaisService } from './gastos-mensais.service';

@Controller('gastos-mensais')
export class GastosMensaisController {
  constructor(
    private readonly gastosMensaisService: GastosMensaisService,
    private readonly contasConjuntasService: ContasConjuntasService,
  ) {}

  @Get()
  async findAll(@Query() query: ListGastosMensaisQuery, @CurrentUser() user: AuthUser) {
    const ids = resolveRequestedUsuarioIds(query.usuarioId, query.usuarioIds);
    const scoped = ids.length ? ids : [user.id];
    await this.contasConjuntasService.assertCanAccessAll(user.id, scoped);
    return this.gastosMensaisService.findAll(scoped, query.competencia);
  }

  @Post()
  create(@Body() dto: CreateGastoMensalDto, @CurrentUser() user: AuthUser) {
    return this.gastosMensaisService.create(dto, user);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGastoMensalDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.gastosMensaisService.update(id, dto, user);
  }

  @Delete(':id/pagamentos')
  desmarcar(
    @Param('id') id: string,
    @Query() query: DeletePagamentoQuery,
    @CurrentUser() user: AuthUser,
  ) {
    return this.gastosMensaisService.desmarcar(id, query.competencia, user);
  }

  @Post(':id/pagamentos')
  pagar(
    @Param('id') id: string,
    @Body() dto: PagamentoCompetenciaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.gastosMensaisService.pagar(id, dto.competencia, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.gastosMensaisService.remove(id, user);
  }
}
