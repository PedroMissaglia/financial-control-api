import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ContasConjuntasService } from '../contas-conjuntas/contas-conjuntas.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly contasConjuntasService: ContasConjuntasService,
  ) {}

  @Get(':id')
  async findById(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.contasConjuntasService.assertCanAccess(user.id, id);
    return this.profilesService.findById(id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProfileDto) {
    if (dto.usuarioId !== user.id || dto.id !== user.id) {
      throw new ForbiddenException('Só é possível criar o próprio perfil');
    }
    return this.profilesService.create(dto);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateProfileDto,
  ) {
    if (id === user.id) {
      return this.profilesService.update(id, dto);
    }

    await this.contasConjuntasService.assertCanAccess(user.id, id);

    if (typeof dto.blocoNotas !== 'string') {
      throw new ForbiddenException(
        'No perfil do cônjuge só é possível atualizar o bloco de notas',
      );
    }

    return this.profilesService.updateBlocoNotas(id, dto.blocoNotas);
  }
}
