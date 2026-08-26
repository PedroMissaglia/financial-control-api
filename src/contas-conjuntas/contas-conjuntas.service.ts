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
import { UsuariosService } from '../usuarios/usuarios.service';
import {
  CONTA_CONJUNTA_VAZIA,
  type ContaConjuntaView,
} from './conta-conjunta.types';
import {
  ContaConjunta,
  ContaConjuntaDocument,
} from './schemas/conta-conjunta.schema';

@Injectable()
export class ContasConjuntasService {
  constructor(
    @InjectModel(ContaConjunta.name)
    private readonly model: Model<ContaConjuntaDocument>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async getView(user: AuthUser): Promise<ContaConjuntaView> {
    const doc = await this.findForUser(user.id);
    if (!doc) return CONTA_CONJUNTA_VAZIA;
    return this.toView(doc, user.id);
  }

  async convidar(user: AuthUser, email: string): Promise<ContaConjuntaView> {
    const normalized = email.trim().toLowerCase();
    if (normalized === user.email.trim().toLowerCase()) {
      throw new BadRequestException('Você não pode convidar a si mesmo');
    }

    const existente = await this.findForUser(user.id);
    if (existente) {
      throw new ConflictException(
        existente.status === 'ativa'
          ? 'Você já tem uma conta conjunta'
          : 'Já existe um convite pendente',
      );
    }

    const convidado = await this.usuariosService.findByEmail(normalized);
    if (!convidado) {
      throw new NotFoundException('Não encontramos uma conta com este e-mail');
    }

    const conflito = await this.findForUser(convidado.id);
    if (conflito) {
      throw new ConflictException(
        'Esta pessoa já participa de uma conta conjunta ou tem um convite pendente',
      );
    }

    const criado = await this.model.create({
      id: createId(),
      status: 'pendente',
      convidanteId: user.id,
      convidadoId: convidado.id,
      convidadoEmail: convidado.email,
      criadoEm: new Date().toISOString(),
      aceitoEm: null,
    });

    return this.toView(criado, user.id);
  }

  async aceitar(user: AuthUser, id: string): Promise<ContaConjuntaView> {
    const doc = await this.getOrThrow(id);
    if (doc.status !== 'pendente') {
      throw new ConflictException('Este convite não está mais pendente');
    }
    if (doc.convidadoId !== user.id) {
      throw new ForbiddenException('Só quem foi convidado pode aceitar');
    }

    doc.status = 'ativa';
    doc.aceitoEm = new Date().toISOString();
    await doc.save();
    return this.toView(doc, user.id);
  }

  async recusar(user: AuthUser, id: string): Promise<ContaConjuntaView> {
    const doc = await this.getOrThrow(id);
    if (doc.status !== 'pendente') {
      throw new ConflictException('Este convite não está mais pendente');
    }
    if (doc.convidadoId !== user.id) {
      throw new ForbiddenException('Só quem foi convidado pode recusar');
    }
    await this.model.deleteOne({ id }).exec();
    return CONTA_CONJUNTA_VAZIA;
  }

  async cancelarConvite(user: AuthUser, id: string): Promise<ContaConjuntaView> {
    const doc = await this.getOrThrow(id);
    if (doc.status !== 'pendente') {
      throw new ConflictException('Este convite não está mais pendente');
    }
    if (doc.convidanteId !== user.id) {
      throw new ForbiddenException('Só quem enviou o convite pode cancelar');
    }
    await this.model.deleteOne({ id }).exec();
    return CONTA_CONJUNTA_VAZIA;
  }

  async encerrar(user: AuthUser): Promise<ContaConjuntaView> {
    const doc = await this.findForUser(user.id);
    if (!doc || doc.status !== 'ativa') {
      throw new NotFoundException('Você não tem uma conta conjunta ativa');
    }
    await this.model.deleteOne({ id: doc.id }).exec();
    return CONTA_CONJUNTA_VAZIA;
  }

  async canAccess(actorId: string, targetUsuarioId: string): Promise<boolean> {
    if (actorId === targetUsuarioId) return true;
    const doc = await this.model
      .findOne({
        status: 'ativa',
        $or: [
          { convidanteId: actorId, convidadoId: targetUsuarioId },
          { convidanteId: targetUsuarioId, convidadoId: actorId },
        ],
      })
      .exec();
    return doc != null;
  }

  async assertCanAccess(actorId: string, targetUsuarioId: string): Promise<void> {
    if (await this.canAccess(actorId, targetUsuarioId)) return;
    throw new ForbiddenException(
      'Você não pode acessar os dados deste usuário',
    );
  }

  async assertCanAccessAll(actorId: string, usuarioIds: string[]): Promise<void> {
    for (const id of usuarioIds) {
      await this.assertCanAccess(actorId, id);
    }
  }

  async getParceiroId(actorId: string): Promise<string | null> {
    const doc = await this.model
      .findOne({
        status: 'ativa',
        $or: [{ convidanteId: actorId }, { convidadoId: actorId }],
      })
      .exec();
    if (!doc) return null;
    return doc.convidanteId === actorId ? doc.convidadoId : doc.convidanteId;
  }

  async getEscopoUsuarioIds(usuarioId: string): Promise<string[]> {
    const parceiroId = await this.getParceiroId(usuarioId);
    return parceiroId ? [usuarioId, parceiroId] : [usuarioId];
  }

  private async findForUser(
    usuarioId: string,
  ): Promise<ContaConjuntaDocument | null> {
    return this.model
      .findOne({
        $or: [{ convidanteId: usuarioId }, { convidadoId: usuarioId }],
      })
      .exec();
  }

  private async getOrThrow(id: string): Promise<ContaConjuntaDocument> {
    const doc = await this.model.findOne({ id }).exec();
    if (!doc) throw new NotFoundException('Convite não encontrado');
    return doc;
  }

  private async toView(
    doc: ContaConjuntaDocument,
    actorId: string,
  ): Promise<ContaConjuntaView> {
    const outroId =
      doc.convidanteId === actorId ? doc.convidadoId : doc.convidanteId;
    const outro = await this.usuariosService.findById(outroId);

    const parceiro = outro
      ? this.usuariosService.toPublic(outro)
      : {
          id: outroId,
          nome: 'Usuário',
          email: doc.convidadoEmail,
        };

    const convite = {
      id: doc.id,
      email: doc.convidadoEmail,
      criadoEm: doc.criadoEm,
    };

    if (doc.status === 'ativa') {
      return { status: 'ativa', parceiro, convite: null };
    }

    if (doc.convidanteId === actorId) {
      return { status: 'convite_enviado', parceiro, convite };
    }

    return { status: 'convite_recebido', parceiro, convite };
  }
}
