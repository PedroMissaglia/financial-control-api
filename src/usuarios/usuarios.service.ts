import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { createId } from '../common/ids';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';

export type UsuarioPublico = {
  id: string;
  nome: string;
  email: string;
};

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<UsuarioDocument>,
  ) {}

  async findAll(): Promise<UsuarioPublico[]> {
    const usuarios = await this.usuarioModel.find().exec();
    return usuarios.map((usuario) => this.toPublic(usuario));
  }

  async findById(id: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({ id }).exec();
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UsuarioDocument | null> {
    return this.usuarioModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+senha')
      .exec();
  }

  async create(dto: CreateUsuarioDto): Promise<UsuarioPublico> {
    const email = dto.email.trim().toLowerCase();
    const existente = await this.usuarioModel.findOne({ email }).exec();
    if (existente) {
      throw new ConflictException('Este e-mail já está cadastrado');
    }

    const criado = await this.usuarioModel.create({
      id: createId(),
      nome: dto.nome.trim(),
      email,
      senha: await bcrypt.hash(dto.senha, 10),
    });

    return this.toPublic(criado);
  }

  async getOrThrow(id: string): Promise<UsuarioDocument> {
    const usuario = await this.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  toPublic(usuario: UsuarioDocument): UsuarioPublico {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };
  }
}
