import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Profile, ProfileDocument } from './schemas/profile.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
  ) {}

  async findById(id: string): Promise<unknown> {
    const profile = await this.profileModel.findOne({ id }).exec();
    if (!profile) {
      throw new NotFoundException('Profile não encontrado');
    }
    return profile.toJSON();
  }

  async create(dto: CreateProfileDto): Promise<unknown> {
    const criado = await this.profileModel.create({ ...dto });
    return criado.toJSON();
  }

  async update(id: string, dto: CreateProfileDto): Promise<unknown> {
    const atualizado = await this.profileModel
      .findOneAndUpdate({ id }, { ...dto, id }, { new: true })
      .exec();

    if (!atualizado) {
      throw new NotFoundException('Profile não encontrado');
    }

    return atualizado.toJSON();
  }
}
