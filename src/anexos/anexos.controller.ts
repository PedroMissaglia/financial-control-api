import { Controller, Get, Param } from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnexosService } from './anexos.service';

@Controller('anexos')
export class AnexosController {
  constructor(private readonly anexosService: AnexosService) {}

  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.anexosService.findByIdForUser(id, user.id);
  }
}
