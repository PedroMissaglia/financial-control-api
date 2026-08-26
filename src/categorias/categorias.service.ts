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
import { createId } from '../common/ids';
import { ContasConjuntasService } from '../contas-conjuntas/contas-conjuntas.service';
import {
  Transacao,
  TransacaoDocument,
} from '../transacoes/schemas/transacao.schema';
import {
  CATEGORIAS_SISTEMA,
  CATEGORIAS_TRANSACAO,
} from '../transacoes/transacao.constants';
import type { CategoriaDto } from './dto/categoria.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria, CategoriaDocument } from './schemas/categoria.schema';

const CATEGORIA_OUTROS = 'outros';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectModel(Categoria.name)
    private readonly categoriaModel: Model<CategoriaDocument>,
    @InjectModel(Transacao.name)
    private readonly transacaoModel: Model<TransacaoDocument>,
    private readonly contasConjuntasService: ContasConjuntasService,
  ) {}

  isSistemaId(id: string): boolean {
    return (CATEGORIAS_TRANSACAO as readonly string[]).includes(id);
  }

  async isValidForUsuario(usuarioId: string, categoria: string): Promise<boolean> {
    if (this.isSistemaId(categoria)) return true;
    const custom = await this.categoriaModel.findOne({ id: categoria }).exec();
    if (!custom) return false;
    const escopo = await this.contasConjuntasService.getEscopoUsuarioIds(usuarioId);
    return escopo.includes(custom.usuarioId);
  }

  async findAll(usuarioIds: string[]): Promise<CategoriaDto[]> {
    const ids = usuarioIds.filter(Boolean);
    const customs =
      ids.length === 0
        ? []
        : await this.categoriaModel.find({ usuarioId: { $in: ids } }).exec();
    const sistema: CategoriaDto[] = CATEGORIAS_TRANSACAO.map((id) => ({
      id,
      nome: CATEGORIAS_SISTEMA[id],
      sistema: true,
    }));
    const proprias: CategoriaDto[] = customs.map((item) => ({
      id: item.id,
      nome: item.nome,
      sistema: false,
      usuarioId: item.usuarioId,
    }));
    return [...sistema, ...proprias];
  }

  async create(dto: CreateCategoriaDto, user: AuthUser): Promise<CategoriaDto> {
    await this.contasConjuntasService.assertCanAccess(user.id, dto.usuarioId);
    const nome = dto.nome.trim();
    this.assertNomeLivreDeSistema(nome);
    await this.assertNomeUnico(dto.usuarioId, nome);

    const criada = await this.categoriaModel.create({
      id: createId(),
      usuarioId: dto.usuarioId,
      nome,
    });

    return { id: criada.id, nome: criada.nome, sistema: false, usuarioId: criada.usuarioId };
  }

  async update(
    id: string,
    dto: UpdateCategoriaDto,
    user: AuthUser,
  ): Promise<CategoriaDto> {
    const doc = await this.getCustomOwned(id, user);
    const nome = dto.nome.trim();
    this.assertNomeLivreDeSistema(nome);
    await this.assertNomeUnico(doc.usuarioId, nome, id);

    doc.nome = nome;
    await doc.save();
    return { id: doc.id, nome: doc.nome, sistema: false, usuarioId: doc.usuarioId };
  }

  async remove(id: string, user: AuthUser): Promise<Record<string, never>> {
    const doc = await this.getCustomOwned(id, user);

    const escopo = await this.contasConjuntasService.getEscopoUsuarioIds(
      doc.usuarioId,
    );
    await this.transacaoModel
      .updateMany(
        { usuarioId: { $in: escopo }, categoria: id },
        { $set: { categoria: CATEGORIA_OUTROS } },
      )
      .exec();

    await this.categoriaModel.deleteOne({ id }).exec();
    return {};
  }

  private async getCustomOwned(
    id: string,
    user: AuthUser,
  ): Promise<CategoriaDocument> {
    if (this.isSistemaId(id)) {
      throw new ForbiddenException('Não é permitido alterar categorias de sistema');
    }

    const doc = await this.categoriaModel.findOne({ id }).exec();
    if (!doc) {
      throw new NotFoundException('Categoria não encontrada');
    }
    if (!(await this.contasConjuntasService.canAccess(user.id, doc.usuarioId))) {
      throw new ForbiddenException('Você não pode alterar esta categoria');
    }
    return doc;
  }

  private assertNomeLivreDeSistema(nome: string): void {
    const normalized = nome.toLowerCase();
    for (const slug of CATEGORIAS_TRANSACAO) {
      if (slug === normalized || CATEGORIAS_SISTEMA[slug].toLowerCase() === normalized) {
        throw new BadRequestException('Nome colide com categoria de sistema');
      }
    }
  }

  private async assertNomeUnico(
    usuarioId: string,
    nome: string,
    exceptId?: string,
  ): Promise<void> {
    const escopo = await this.contasConjuntasService.getEscopoUsuarioIds(usuarioId);
    const existentes = await this.categoriaModel
      .find({ usuarioId: { $in: escopo } })
      .exec();
    const normalized = nome.toLowerCase();
    const duplicada = existentes.some(
      (item) => item.id !== exceptId && item.nome.trim().toLowerCase() === normalized,
    );
    if (duplicada) {
      throw new ConflictException('Já existe uma categoria com este nome');
    }
  }
}
