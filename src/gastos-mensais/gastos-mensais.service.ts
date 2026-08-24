import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { AuthUser } from '../auth/auth.types';
import { CategoriasService } from '../categorias/categorias.service';
import { createId } from '../common/ids';
import { ContasConjuntasService } from '../contas-conjuntas/contas-conjuntas.service';
import { TransacoesService } from '../transacoes/transacoes.service';
import type { FormaPagamento } from '../transacoes/transacao.constants';
import { CreateGastoMensalDto } from './dto/create-gasto-mensal.dto';
import { UpdateGastoMensalDto } from './dto/update-gasto-mensal.dto';
import { competenciaAtualUtc, dataHojeSaoPaulo } from './gastos-mensais.helpers';
import {
  GastoMensalPagamento,
  GastoMensalPagamentoDocument,
} from './schemas/gasto-mensal-pagamento.schema';
import { GastoMensal, GastoMensalDocument } from './schemas/gasto-mensal.schema';

const CATEGORIA_PADRAO = 'outros';
const HORA_LANCAMENTO = '12:00:00';

export type GastoMensalListItem = {
  id: string;
  usuarioId: string;
  titulo: string;
  descricao: string;
  diaVencimento: number;
  valor: number;
  categoria: string;
  formaPagamento: FormaPagamento | null;
  pago: boolean;
  transacaoId: string | null;
};

@Injectable()
export class GastosMensaisService {
  constructor(
    @InjectModel(GastoMensal.name)
    private readonly gastoModel: Model<GastoMensalDocument>,
    @InjectModel(GastoMensalPagamento.name)
    private readonly pagamentoModel: Model<GastoMensalPagamentoDocument>,
    private readonly transacoesService: TransacoesService,
    private readonly categoriasService: CategoriasService,
    private readonly contasConjuntasService: ContasConjuntasService,
  ) {}

  async findAll(
    usuarioIds: string[],
    competencia?: string,
  ): Promise<GastoMensalListItem[]> {
    const ids = usuarioIds.filter(Boolean);
    const mes = competencia ?? competenciaAtualUtc();
    const templates =
      ids.length === 0
        ? []
        : await this.gastoModel
            .find({ usuarioId: { $in: ids } })
            .sort({ diaVencimento: 1, titulo: 1 })
            .exec();

    const gastoIds = templates.map((item) => item.id);
    const pagamentos =
      gastoIds.length === 0
        ? []
        : await this.pagamentoModel
            .find({ usuarioId: { $in: ids }, competencia: mes, gastoId: { $in: gastoIds } })
            .exec();

    const porGasto = new Map(
      pagamentos.map((item) => [item.gastoId, item] as const),
    );

    const result: GastoMensalListItem[] = [];
    for (const template of templates) {
      const pagamento = porGasto.get(template.id);
      if (!pagamento) {
        result.push(this.toListItem(template, false, null));
        continue;
      }

      const existe = await this.transacaoExiste(pagamento.transacaoId);
      if (existe) {
        result.push(this.toListItem(template, true, pagamento.transacaoId));
        continue;
      }

      await this.pagamentoModel.deleteOne({ id: pagamento.id }).exec();
      result.push(this.toListItem(template, false, null));
    }

    return result;
  }

  async create(dto: CreateGastoMensalDto, user: AuthUser): Promise<unknown> {
    await this.contasConjuntasService.assertCanAccess(user.id, dto.usuarioId);
    const categoria = dto.categoria?.trim() || CATEGORIA_PADRAO;
    await this.assertCategoriaValida(dto.usuarioId, categoria);

    const criado = await this.gastoModel.create({
      id: createId(),
      usuarioId: dto.usuarioId,
      titulo: dto.titulo.trim(),
      descricao: (dto.descricao ?? '').trim(),
      diaVencimento: dto.diaVencimento,
      valor: dto.valor,
      categoria,
      formaPagamento: dto.formaPagamento ?? null,
    });

    return criado.toJSON();
  }

  async update(
    id: string,
    dto: UpdateGastoMensalDto,
    user: AuthUser,
  ): Promise<unknown> {
    const doc = await this.getOwned(id, user);
    const categoria = dto.categoria?.trim() || CATEGORIA_PADRAO;
    await this.assertCategoriaValida(doc.usuarioId, categoria);

    doc.titulo = dto.titulo.trim();
    doc.descricao = (dto.descricao ?? '').trim();
    doc.diaVencimento = dto.diaVencimento;
    doc.valor = dto.valor;
    doc.categoria = categoria;
    doc.formaPagamento = dto.formaPagamento ?? null;
    await doc.save();

    return doc.toJSON();
  }

  async remove(id: string, user: AuthUser): Promise<Record<string, never>> {
    await this.getOwned(id, user);
    await this.pagamentoModel.deleteMany({ gastoId: id }).exec();
    await this.gastoModel.deleteOne({ id }).exec();
    return {};
  }

  async pagar(
    id: string,
    competencia: string,
    user: AuthUser,
  ): Promise<GastoMensalListItem> {
    const gasto = await this.getOwned(id, user);

    const existente = await this.pagamentoModel
      .findOne({ usuarioId: gasto.usuarioId, gastoId: id, competencia })
      .exec();

    if (existente) {
      if (await this.transacaoExiste(existente.transacaoId)) {
        throw new ConflictException('Este gasto já foi pago nesta competência');
      }
      await this.pagamentoModel.deleteOne({ id: existente.id }).exec();
    }

    const criada = (await this.transacoesService.create({
      usuarioId: gasto.usuarioId,
      tipo: 'pagamento',
      valor: gasto.valor,
      data: dataHojeSaoPaulo(),
      hora: HORA_LANCAMENTO,
      descricao: gasto.titulo,
      categoria: gasto.categoria,
      formaPagamento: gasto.formaPagamento,
    })) as { id: string };

    await this.pagamentoModel.create({
      id: createId(),
      usuarioId: gasto.usuarioId,
      gastoId: id,
      competencia,
      transacaoId: criada.id,
    });

    return this.toListItem(gasto, true, criada.id);
  }

  async desmarcar(
    id: string,
    competencia: string,
    user: AuthUser,
  ): Promise<Record<string, never>> {
    const gasto = await this.getOwned(id, user);
    const pagamento = await this.pagamentoModel
      .findOne({ usuarioId: gasto.usuarioId, gastoId: id, competencia })
      .exec();

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    try {
      await this.transacoesService.remove(pagamento.transacaoId);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    await this.pagamentoModel.deleteOne({ id: pagamento.id }).exec();
    return {};
  }

  private async getOwned(
    id: string,
    user: AuthUser,
  ): Promise<GastoMensalDocument> {
    const doc = await this.gastoModel.findOne({ id }).exec();
    if (!doc) {
      throw new NotFoundException('Gasto mensal não encontrado');
    }
    if (!(await this.contasConjuntasService.canAccess(user.id, doc.usuarioId))) {
      throw new ForbiddenException('Você não pode alterar este gasto mensal');
    }
    return doc;
  }

  private async assertCategoriaValida(
    usuarioId: string,
    categoria: string,
  ): Promise<void> {
    const valida = await this.categoriasService.isValidForUsuario(
      usuarioId,
      categoria,
    );
    if (!valida) {
      throw new BadRequestException('Categoria inválida');
    }
  }

  private async transacaoExiste(transacaoId: string): Promise<boolean> {
    try {
      await this.transacoesService.findById(transacaoId);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) return false;
      throw error;
    }
  }

  private toListItem(
    gasto: GastoMensalDocument,
    pago: boolean,
    transacaoId: string | null,
  ): GastoMensalListItem {
    return {
      id: gasto.id,
      usuarioId: gasto.usuarioId,
      titulo: gasto.titulo,
      descricao: gasto.descricao ?? '',
      diaVencimento: gasto.diaVencimento,
      valor: gasto.valor,
      categoria: gasto.categoria,
      formaPagamento: gasto.formaPagamento ?? null,
      pago,
      transacaoId,
    };
  }
}
