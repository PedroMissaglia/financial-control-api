import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ContasConjuntasService } from './contas-conjuntas.service';
import { CreateConviteDto } from './dto/create-convite.dto';

@Controller('contas-conjuntas')
export class ContasConjuntasController {
  constructor(private readonly contasConjuntasService: ContasConjuntasService) {}

  @Get()
  getView(@CurrentUser() user: AuthUser) {
    return this.contasConjuntasService.getView(user);
  }

  @Post('convites')
  convidar(@CurrentUser() user: AuthUser, @Body() dto: CreateConviteDto) {
    return this.contasConjuntasService.convidar(user, dto.email);
  }

  @Post('convites/:id/aceitar')
  aceitar(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.contasConjuntasService.aceitar(user, id);
  }

  @Post('convites/:id/recusar')
  recusar(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.contasConjuntasService.recusar(user, id);
  }

  @Delete('convites/:id')
  cancelar(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.contasConjuntasService.cancelarConvite(user, id);
  }

  @Delete()
  encerrar(@CurrentUser() user: AuthUser) {
    return this.contasConjuntasService.encerrar(user);
  }
}
