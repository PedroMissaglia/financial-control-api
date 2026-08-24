import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContasConjuntasModule } from '../contas-conjuntas/contas-conjuntas.module';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { Profile, ProfileSchema } from './schemas/profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    ContasConjuntasModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
