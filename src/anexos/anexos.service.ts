import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createId } from '../common/ids';
import type { AnexoInput } from './anexo.types';
import { Anexo, AnexoDocument } from './schemas/anexo.schema';

@Injectable()
export class AnexosService {
  constructor(
    @InjectModel(Anexo.name)
    private readonly anexoModel: Model<AnexoDocument>,
  ) {}

  async findByIdForUser(id: string, usuarioId: string): Promise<unknown> {
    const anexo = await this.anexoModel.findOne({ id }).exec();
    if (!anexo || anexo.usuarioId !== usuarioId) {
      throw new NotFoundException('Anexo não encontrado');
    }
    return anexo.toJSON();
  }

  async createForTransacao(input: AnexoInput): Promise<{ id: string }> {
    const criado = await this.anexoModel.create({
      id: createId(),
      transacaoId: input.transacaoId,
      usuarioId: input.usuarioId,
      nome: input.nome,
      mimeType: input.mimeType,
      dataUrl: input.dataUrl,
    });
    return { id: criado.id };
  }

  async upsertForTransacao(input: AnexoInput): Promise<{ id: string }> {
    const existente = await this.anexoModel
      .findOne({ transacaoId: input.transacaoId })
      .exec();
    if (!existente) {
      return this.createForTransacao(input);
    }

    existente.usuarioId = input.usuarioId;
    existente.nome = input.nome;
    existente.mimeType = input.mimeType;
    existente.dataUrl = input.dataUrl;
    await existente.save();
    return { id: existente.id };
  }

  async removeByTransacaoId(transacaoId: string): Promise<void> {
    await this.anexoModel.deleteOne({ transacaoId }).exec();
  }
}
