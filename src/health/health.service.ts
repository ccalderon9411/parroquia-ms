import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { Prisma } from '../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.prismaService.$queryRaw(Prisma.sql`SELECT 1`);

      return indicator.up({
        timestamp: new Date().toISOString(),
      });
    } catch {
      return indicator.down({
        timestamp: new Date().toISOString(),
        message: 'Prisma no pudo conectarse a la base de datos.',
      });
    }
  }

  isAlive(key: string): HealthIndicatorResult {
    return this.healthIndicatorService.check(key).up({
      timestamp: new Date().toISOString(),
    });
  }
}
