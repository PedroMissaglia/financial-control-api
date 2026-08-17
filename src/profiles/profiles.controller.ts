import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.profilesService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProfileDto) {
    return this.profilesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateProfileDto) {
    return this.profilesService.update(id, dto);
  }
}
