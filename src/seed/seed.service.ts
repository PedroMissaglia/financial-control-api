import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { readFile } from 'fs/promises';
import { Model } from 'mongoose';
import { join } from 'path';
import { Profile, ProfileDocument } from '../profiles/schemas/profile.schema';
import {
  Transacao,
  TransacaoDocument,
} from '../transacoes/schemas/transacao.schema';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema';

interface SeedUsuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
}

interface SeedTransacao {
  id: string;
  usuarioId: string;
  tipo: string;
  valor: number;
  data: string;
  hora?: string;
  descricao: string;
  categoria: string;
  anexo?: { nome: string; mimeType: string; dataUrl: string } | null;
}

interface SeedProfile {
  id: string;
  usuarioId: string;
  [key: string]: unknown;
}

interface SeedFile {
  usuarios: SeedUsuario[];
  transacoes: SeedTransacao[];
  profiles: SeedProfile[];
}

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<UsuarioDocument>,
    @InjectModel(Transacao.name)
    private readonly transacaoModel: Model<TransacaoDocument>,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    const seedPath = join(process.cwd(), 'data', 'db.json');
    let data: SeedFile | null = null;

    try {
      const raw = await readFile(seedPath, 'utf8');
      data = JSON.parse(raw) as SeedFile;
    } catch (error) {
      this.logger.warn(
        `Seed ignorado: não foi possível ler ${seedPath} (${String(error)})`,
      );
    }

    if (data && (await this.usuarioModel.countDocuments()) === 0 && data.usuarios?.length) {
      const usuarios = await Promise.all(
        data.usuarios.map(async (usuario) => ({
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email.trim().toLowerCase(),
          senha: await bcrypt.hash(usuario.senha, 10),
        })),
      );
      await this.usuarioModel.insertMany(usuarios);
      this.logger.log(`Seed: ${usuarios.length} usuários`);
    }

    if (
      data &&
      (await this.transacaoModel.countDocuments()) === 0 &&
      data.transacoes?.length
    ) {
      await this.transacaoModel.insertMany(
        data.transacoes.map((transacao) => ({
          id: transacao.id,
          usuarioId: transacao.usuarioId,
          tipo: transacao.tipo,
          valor: transacao.valor,
          data: transacao.data,
          hora: transacao.hora ?? '00:00:00',
          descricao: transacao.descricao,
          categoria: transacao.categoria,
          anexo: transacao.anexo ?? null,
        })),
      );
      this.logger.log(`Seed: ${data.transacoes.length} transações`);
    }

    if (data && (await this.profileModel.countDocuments()) === 0 && data.profiles?.length) {
      await this.profileModel.insertMany(data.profiles);
      this.logger.log(`Seed: ${data.profiles.length} profiles`);
    }

    const backfill = await this.transacaoModel.updateMany(
      { $or: [{ hora: { $exists: false } }, { hora: null }, { hora: '' }] },
      { $set: { hora: '00:00:00' } },
    );
    if (backfill.modifiedCount > 0) {
      this.logger.log(
        `Seed: ${backfill.modifiedCount} transações receberam hora 00:00:00`,
      );
    }
  }
}
