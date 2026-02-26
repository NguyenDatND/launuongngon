import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    controller = module.get<HealthController>(HealthController);
  });

  it('GET /health returns { data: { status: "ok" } }', () => {
    const res = controller.check();
    expect(res).toEqual({ data: { status: 'ok' } });
  });
});
