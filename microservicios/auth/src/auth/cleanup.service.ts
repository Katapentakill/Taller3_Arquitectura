import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TokenBlacklist } from '../entities/blacklist.entity';

@Injectable()
export class CleanupService {
  constructor(
    @InjectRepository(TokenBlacklist)
    private readonly blacklistRepo: Repository<TokenBlacklist>,
  ) {}

  @Cron('0 * * * *') // Cada 1 hora en el minuto 0

    async limpiar() {
    const now = new Date();
    const result = await this.blacklistRepo.delete({ expiresAt: LessThan(now) });

    if ((result.affected ?? 0) > 0) {
        console.log(`[Blacklist] 🧹 Tokens expirados eliminados: ${result.affected}`);
    }
    }
}