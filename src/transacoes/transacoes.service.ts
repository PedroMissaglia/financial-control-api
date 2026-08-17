import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createId } from '../common/ids';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { ListTransacoesQuery } from './dto/list-transacoes.query';
import { Transacao, TransacaoDocument } from './schemas/transacao.schema';
import type { CategoriaTransacao, TipoTransacao } from './transacao.constants';

type TransacaoFiltro = {
  usuarioId?: string;
  tipo?: TipoTransacao;
  categoria?: CategoriaTransacao;
  descricao?: { $regex: string; $options: string };
  data?: { $gte?: string; $lte?: string };
  valor?: { $gte?: number; $lte?: number };
};

export type TransacoesPage = {
  items: unknown[];
  total: number;
  page: number;
  pageSize: number;
  totalUnfiltered: number;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class TransacoesService {
  constructor(
    @InjectModel(Transacao.name)
    private readonly transacaoModel: Model<TransacaoDocument>,
  ) {}

  async findAll(query: ListTransacoesQuery): Promise<TransacoesPage> {
    const filtro = this.montarFiltro(query);
    const usuarioFiltro: TransacaoFiltro = query.usuarioId
      ? { usuarioId: query.usuarioId }
      : {};
    const paginated = query.pageSize != null;
    const page = paginated ? (query.page ?? 1) : 1;
    const pageSize = paginated ? Math.min(query.pageSize ?? 1, 100) : 0;

    const [items, total, totalUnfiltered] = await Promise.all([
      paginated
        ? this.transacaoModel
            .find(filtro)
            .sort({ data: -1, hora: -1, _id: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec()
        : this.transacaoModel
            .find(filtro)
            .sort({ data: -1, hora: -1, _id: -1 })
            .exec(),
      this.transacaoModel.countDocuments(filtro).exec(),
      this.transacaoModel.countDocuments(usuarioFiltro).exec(),
    ]);

    const mapped = items.map((item) => item.toJSON());

    return {
      items: mapped,
      total,
      page,
      pageSize: paginated ? pageSize : mapped.length,
      totalUnfiltered,
    };
  }

  async findById(id: string): Promise<unknown> {
    const transacao = await this.transacaoModel.findOne({ id }).exec();
    if (!transacao) {
      throw new NotFoundException('Transação não encontrada');
    }
    return transacao.toJSON();
  }

  async create(dto: CreateTransacaoDto): Promise<unknown> {
    const criada = await this.transacaoModel.create({
      ...dto,
      id: createId(),
      anexo: dto.anexo ?? null,
    });
    return criada.toJSON();
  }

  async update(id: string, dto: CreateTransacaoDto): Promise<unknown> {
    const atualizada = await this.transacaoModel
      .findOneAndUpdate(
        { id },
        {
          usuarioId: dto.usuarioId,
          tipo: dto.tipo,
          valor: dto.valor,
          data: dto.data,
          hora: dto.hora,
          descricao: dto.descricao,
          categoria: dto.categoria,
          anexo: dto.anexo ?? null,
        },
        { new: true },
      )
      .exec();

    if (!atualizada) {
      throw new NotFoundException('Transação não encontrada');
    }

    return atualizada.toJSON();
  }

  async remove(id: string): Promise<Record<string, never>> {
    const resultado = await this.transacaoModel.findOneAndDelete({ id }).exec();
    if (!resultado) {
      throw new NotFoundException('Transação não encontrada');
    }
    return {};
  }

  private montarFiltro(query: ListTransacoesQuery): TransacaoFiltro {
    const filtro: TransacaoFiltro = {};

    if (query.usuarioId) {
      filtro.usuarioId = query.usuarioId;
    }

    const busca = query.busca?.trim();
    if (busca) {
      filtro.descricao = { $regex: escapeRegex(busca), $options: 'i' };
    }

    if (query.tipo) {
      filtro.tipo = query.tipo;
    }

    if (query.categoria) {
      filtro.categoria = query.categoria;
    }

    if (query.dataInicio || query.dataFim) {
      filtro.data = {};
      if (query.dataInicio) filtro.data.$gte = query.dataInicio;
      if (query.dataFim) filtro.data.$lte = query.dataFim;
    }

    if (query.valorMin != null || query.valorMax != null) {
      filtro.valor = {};
      if (query.valorMin != null) filtro.valor.$gte = query.valorMin;
      if (query.valorMax != null) filtro.valor.$lte = query.valorMax;
    }

    return filtro;
  }
}
