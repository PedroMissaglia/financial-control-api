import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { hashToken } from '../common/crypto';
import { createId, createRefreshToken } from '../common/ids';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuthUser, TokenResponse } from './auth.types';
import { LoginDto } from './dto/login.dto';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';

const ACCESS_EXPIRES_SECONDS = 300;

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async login(dto: LoginDto): Promise<TokenResponse> {
    const usuario = await this.usuariosService.findByEmailWithPassword(
      dto.email,
    );
    const senhaOk =
      usuario && (await bcrypt.compare(dto.senha, usuario.senha));

    if (!usuario || !senhaOk) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    return this.issueTokens(this.usuariosService.toPublic(usuario));
  }

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.refreshTokenModel
      .findOne({
        tokenHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      })
      .exec();

    if (!stored) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    stored.revokedAt = new Date();
    await stored.save();

    const usuario = await this.usuariosService.findById(stored.usuarioId);
    if (!usuario) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    return this.issueTokens(this.usuariosService.toPublic(usuario));
  }

  async logout(user: AuthUser, refreshToken?: string): Promise<{ ok: true }> {
    if (refreshToken) {
      await this.refreshTokenModel
        .updateOne(
          { tokenHash: hashToken(refreshToken), usuarioId: user.id },
          { revokedAt: new Date() },
        )
        .exec();
    } else {
      await this.refreshTokenModel
        .updateMany({ usuarioId: user.id, revokedAt: null }, { revokedAt: new Date() })
        .exec();
    }

    return { ok: true };
  }

  private async issueTokens(usuario: {
    id: string;
    nome: string;
    email: string;
  }): Promise<TokenResponse> {
    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
      email: usuario.email,
    });
    const refreshToken = createRefreshToken();
    const ttlMs = this.refreshTtlMs();

    await this.refreshTokenModel.create({
      id: createId(),
      usuarioId: usuario.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + ttlMs),
      revokedAt: null,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_EXPIRES_SECONDS,
      tokenType: 'Bearer',
      usuario,
    };
  }

  private refreshTtlMs(): number {
    const raw = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
    const match = /^(\d+)([smhd])$/.exec(raw);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return amount * (multipliers[unit] ?? 86_400_000);
  }
}
