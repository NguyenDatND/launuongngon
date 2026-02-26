import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

// Prevent real Redis connections during unit tests
jest.mock('redis', () => {
  const connectMock = jest.fn().mockResolvedValue(undefined);
  const quitMock = jest.fn().mockResolvedValue(undefined);
  const onMock = jest.fn().mockReturnThis();
  return {
    createClient: jest.fn().mockReturnValue({
      connect: connectMock,
      quit: quitMock,
      on: onMock,
    }),
  };
});

describe('RedisService', () => {
  let service: RedisService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('redis://localhost:6379') },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('reads REDIS_URL from ConfigService on init', async () => {
    await service.onModuleInit();
    expect(configService.get).toHaveBeenCalledWith('REDIS_URL', 'redis://localhost:6379');
  });

  it('exposes getClient() after init', async () => {
    await service.onModuleInit();
    expect(service.getClient()).not.toBeNull();
  });

  it('sets client to null after destroy', async () => {
    await service.onModuleInit();
    await service.onModuleDestroy();
    expect(service.getClient()).toBeNull();
  });
});
