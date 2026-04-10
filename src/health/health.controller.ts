import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly healthService: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.readiness();
  }

  @Get('live')
  @HealthCheck()
  liveness() {
    return this.healthCheckService.check([
      async () => this.healthService.isAlive('application'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.healthCheckService.check([
      async () => this.healthService.isHealthy('database'),
    ]);
  }
}