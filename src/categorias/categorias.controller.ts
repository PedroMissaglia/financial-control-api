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
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { ListCategoriasQuery } from './dto/list-categorias.query';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Controller('categorias')
export class CategoriasController {
  constructor(
    private readonly categoriasService: CategoriasService,
    private readonly contasConjuntasService: ContasConjuntasService,
  ) {}

  @Get()
  async findAll(@Query() query: ListCategoriasQuery, @CurrentUser() user: AuthUser) {
    const ids = resolveRequestedUsuarioIds(query.usuarioId, query.usuarioIds);
    if (ids.length) {
      await this.contasConjuntasService.assertCanAccessAll(user.id, ids);
    }
    return this.categoriasService.findAll(ids.length ? ids : [user.id]);
  }

  @Post()
  create(@Body() dto: CreateCategoriaDto, @CurrentUser() user: AuthUser) {
    return this.categoriasService.create(dto, user);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoriaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.categoriasService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.categoriasService.remove(id, user);
  }
}
