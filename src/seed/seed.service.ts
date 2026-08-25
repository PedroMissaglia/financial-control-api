import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { readFile } from 'fs/promises';
import { Model } from 'mongoose';
import { join } from 'path';
import { Anexo, AnexoDocument } from '../anexos/schemas/anexo.schema';
import { createId } from '../common/ids';
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

interface SeedAnexo {
  nome: string;
  mimeType: string;
  dataUrl: string;
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
  formaPagamento?: string | null;
  anexo?: SeedAnexo | null;
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

type AnexoEmbutido = {
  nome?: string;
  mimeType?: string;
  dataUrl?: string;
};

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<UsuarioDocument>,
    @InjectModel(Transacao.name)
    private readonly transacaoModel: Model<TransacaoDocument>,
    @InjectModel(Anexo.name)
    private readonly anexoModel: Model<AnexoDocument>,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    private readonly config: ConfigService,
  ) {}

  private seedOnBoot(): boolean {
    const raw = this.config.get<string>('SEED_ON_BOOT')?.trim().toLowerCase();
    return raw === 'true' || raw === '1';
  }

  async onModuleInit(): Promise<void> {
    if (this.seedOnBoot()) {
      await this.seedFromFile();
    } else {
      this.logger.log(
        'Seed de data/db.json ignorado (SEED_ON_BOOT não está ativo)',
      );
    }

    const horaBackfill = await this.transacaoModel.updateMany(
      { $or: [{ hora: { $exists: false } }, { hora: null }, { hora: '' }] },
      { $set: { hora: '00:00:00' } },
    );
    if (horaBackfill.modifiedCount > 0) {
      this.logger.log(
        `Seed: ${horaBackfill.modifiedCount} transações receberam hora 00:00:00`,
      );
    }

    await this.migrarAnexosEmbutidos();

    const formaBackfill = await this.transacaoModel.updateMany(
      { formaPagamento: { $exists: false } },
      { $set: { formaPagamento: null } },
    );
    if (formaBackfill.modifiedCount > 0) {
      this.logger.log(
        `Seed: ${formaBackfill.modifiedCount} transações receberam formaPagamento null`,
      );
    }

    const anexoIdBackfill = await this.transacaoModel.updateMany(
      { anexoId: { $exists: false } },
      { $set: { anexoId: null } },
    );
    if (anexoIdBackfill.modifiedCount > 0) {
      this.logger.log(
        `Seed: ${anexoIdBackfill.modifiedCount} transações receberam anexoId null`,
      );
    }
  }

  private async seedFromFile(): Promise<void> {
    const seedPath = join(process.cwd(), 'data', 'db.json');
    let data: SeedFile | null = null;

    try {
      const raw = await readFile(seedPath, 'utf8');
      data = JSON.parse(raw) as SeedFile;
    } catch (error) {
      this.logger.warn(
        `Seed ignorado: não foi possível ler ${seedPath} (${String(error)})`,
      );
      return;
    }

    if (
      data &&
      (await this.usuarioModel.countDocuments()) === 0 &&
      data.usuarios?.length
    ) {
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
      const anexos: Array<{
        id: string;
        transacaoId: string;
        usuarioId: string;
        nome: string;
        mimeType: string;
        dataUrl: string;
      }> = [];

      const transacoes = data.transacoes.map((transacao) => {
        const anexo = transacao.anexo ?? null;
        let anexoId: string | null = null;
        if (anexo) {
          anexoId = createId();
          anexos.push({
            id: anexoId,
            transacaoId: transacao.id,
            usuarioId: transacao.usuarioId,
            nome: anexo.nome,
            mimeType: anexo.mimeType,
            dataUrl: anexo.dataUrl,
          });
        }
        return {
          id: transacao.id,
          usuarioId: transacao.usuarioId,
          tipo: transacao.tipo,
          valor: transacao.valor,
          data: transacao.data,
          hora: transacao.hora ?? '00:00:00',
          descricao: transacao.descricao,
          categoria: transacao.categoria,
          formaPagamento: transacao.formaPagamento ?? null,
          anexoId,
        };
      });

      await this.transacaoModel.insertMany(transacoes);
      if (anexos.length > 0) {
        await this.anexoModel.insertMany(anexos);
      }
      this.logger.log(
        `Seed: ${transacoes.length} transações` +
          (anexos.length ? `, ${anexos.length} anexos` : ''),
      );
    }

    if (
      data &&
      (await this.profileModel.countDocuments()) === 0 &&
      data.profiles?.length
    ) {
      await this.profileModel.insertMany(data.profiles);
      this.logger.log(`Seed: ${data.profiles.length} profiles`);
    }
  }

  private async migrarAnexosEmbutidos(): Promise<void> {
    const legado = this.transacaoModel.collection.find({
      anexo: { $exists: true, $type: 'object' },
    });

    let migrados = 0;
    for await (const doc of legado) {
      const anexo = doc.anexo as AnexoEmbutido | null;
      const transacaoId = String(doc.id ?? '');
      const usuarioId = String(doc.usuarioId ?? '');

      if (!anexo?.dataUrl || !transacaoId) {
        await this.transacaoModel.collection.updateOne(
          { _id: doc._id },
          { $unset: { anexo: 1 }, $set: { anexoId: null } },
        );
        continue;
      }

      const existente = await this.anexoModel
        .findOne({ transacaoId })
        .exec();
      const anexoId = existente?.id ?? createId();
      if (!existente) {
        await this.anexoModel.create({
          id: anexoId,
          transacaoId,
          usuarioId,
          nome: anexo.nome ?? 'anexo',
          mimeType: anexo.mimeType ?? 'application/octet-stream',
          dataUrl: anexo.dataUrl,
        });
      }

      await this.transacaoModel.collection.updateOne(
        { _id: doc._id },
        { $set: { anexoId }, $unset: { anexo: 1 } },
      );
      migrados += 1;
    }

    const unset = await this.transacaoModel.collection.updateMany(
      { anexo: { $exists: true } },
      { $unset: { anexo: 1 } },
    );
    if (unset.modifiedCount > 0) {
      this.logger.log(
        `Seed: campo anexo removido de ${unset.modifiedCount} transações`,
      );
    }

    if (migrados > 0) {
      this.logger.log(`Seed: ${migrados} anexos migrados para a collection anexos`);
    }
  }
}
