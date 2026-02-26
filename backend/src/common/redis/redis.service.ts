import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null = null;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.client = createClient({ url });
    this.client.on('error', (err) => this.logger.error('Redis client error', err));
    try {
      await this.client.connect();
      this.logger.log('Redis connected successfully');
    } catch (err) {
      this.logger.error('Redis connection failed', err);
      throw err;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.logger.log('Redis disconnected');
    }
  }

  getClient(): RedisClientType | null {
    return this.client;
  }
}
