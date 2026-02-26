import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { RedisService } from '../src/common/redis/redis.service';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let branchId: string;
  let managerId: string;
  let managerToken: string;
  let staffToken: string;
  let managerEmail: string;

  const mockRedisService = {
    onModuleInit: jest.fn().mockResolvedValue(undefined),
    onModuleDestroy: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisService)
      .useValue(mockRedisService)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    jwt = moduleFixture.get(JwtService);
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const branch = await prisma.branch.create({
      data: { name: 'Users E2E Branch', address: 'Addr', phone: '123' },
    });
    branchId = branch.id;
    const managerHash = await bcrypt.hash('manager123', 10);
    const manager = await prisma.user.create({
      data: {
        email: 'manager@users-e2e.com',
        passwordHash: managerHash,
        name: 'Manager',
        role: 'manager',
        branchId,
        isActive: true,
      },
    });
    managerId = manager.id;
    managerEmail = manager.email;
    const staffHash = await bcrypt.hash('staff123', 10);
    await prisma.user.create({
      data: {
        email: 'staff@users-e2e.com',
        passwordHash: staffHash,
        name: 'Staff',
        role: 'staff',
        branchId,
        isActive: true,
      },
    });

    const managerLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'manager@users-e2e.com', password: 'manager123' });
    managerToken = managerLogin.body.data.accessToken;

    const staffLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'staff@users-e2e.com', password: 'staff123' });
    staffToken = staffLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({ where: { branchId } });
    await prisma.branch.delete({ where: { id: branchId } });
    await app.close();
  });

  describe('POST /api/users', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({ email: 'new@test.com', password: 'p', name: 'New', role: 'staff', branchId })
        .expect(401);
    });

    it('returns 403 for staff role', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ email: 'new2@test.com', password: 'p', name: 'New', role: 'staff', branchId })
        .expect(403);
    });

    it('returns 400 INVALID_ROLE for role guest', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ email: 'guest@test.com', password: 'p', name: 'G', role: 'guest', branchId })
        .expect(400)
        .expect((res) => {
          expect(res.body.error.code).toBe('INVALID_ROLE');
          expect(res.body.error.message).toContain('guest');
        });
    });

    it('returns 409 EMAIL_ALREADY_EXISTS for duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ email: 'staff@users-e2e.com', password: 'p', name: 'Dup', role: 'staff', branchId })
        .expect(409)
        .expect((res) => {
          expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
        });
    });

    it('returns 201 and creates staff for manager', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          email: 'newstaff@users-e2e.com',
          password: 'secure123',
          name: 'New Staff',
          role: 'staff',
          branchId,
        })
        .expect(201);
      expect(res.body.data).toMatchObject({
        email: 'newstaff@users-e2e.com',
        name: 'New Staff',
        role: 'staff',
        branchId,
      });
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).not.toHaveProperty('passwordHash');
      await prisma.user.deleteMany({ where: { email: 'newstaff@users-e2e.com' } });
    });

    it('allows newly created staff to log in with given credentials', async () => {
      const email = 'login-after-create@users-e2e.com';
      const password = 'strongpass123';

      const createRes = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          email,
          password,
          name: 'Login After Create',
          role: 'staff',
          branchId,
        })
        .expect(201);

      expect(createRes.body.data).toMatchObject({
        email,
        name: 'Login After Create',
        role: 'staff',
        branchId,
      });

      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200);

      expect(loginRes.body.data).toMatchObject({
        user: {
          email,
          role: 'staff',
          branchId,
        },
      });

      await prisma.user.deleteMany({ where: { email } });
    });
  });

  describe('GET /api/users', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer()).get('/api/users').expect(401);
    });

    it('returns 403 for staff role', () => {
      return request(app.getHttpServer()).get('/api/users').set('Authorization', `Bearer ${staffToken}`).expect(403);
    });

    it('returns list scoped to manager branch for manager', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.every((u: any) => u.branchId === branchId)).toBe(true);
        });
    });

    it('returns 401 for expired access token', async () => {
      const expiredToken = jwt.sign(
        { sub: managerId, email: managerEmail, role: 'manager', branchId },
        // Negative expiresIn makes token immediately expired (avoid flaky sleeps).
        { expiresIn: -10 },
      );

      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid or expired access token',
              details: {},
            },
          });
        });
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('returns 403 for staff role', () => {
      return request(app.getHttpServer())
        .patch(`/api/users/${managerId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ isActive: false })
        .expect(403);
    });

    it('returns 200 and updates isActive for manager', async () => {
      const created = await prisma.user.create({
        data: {
          email: 'deactivate@users-e2e.com',
          passwordHash: await bcrypt.hash('x', 10),
          name: 'Deact',
          role: 'staff',
          branchId,
          isActive: true,
        },
      });
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${created.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ isActive: false })
        .expect(200);
      expect(res.body.data.isActive).toBe(false);
      const refreshed = await prisma.user.findUnique({ where: { id: created.id } });
      expect(refreshed?.isActive).toBe(false);
      await prisma.user.delete({ where: { id: created.id } });
    });

    it('revokes existing sessions and prevents login after deactivation', async () => {
      const email = 'deactivate-session@users-e2e.com';
      const password = 'session123';
      const created = await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(password, 10),
          name: 'Deactivate Session',
          role: 'staff',
          branchId,
          isActive: true,
        },
      });

      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200);

      const cookies = loginRes.headers['set-cookie'];

      await request(app.getHttpServer())
        .patch(`/api/users/${created.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ isActive: false })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password })
        .expect(401)
        .expect((res) => {
          expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
          expect(res.body.error.message).toBe('Invalid email or password.');
        });

      if (cookies) {
        await request(app.getHttpServer())
          .post('/api/auth/refresh')
          .set('Cookie', Array.isArray(cookies) ? cookies : [cookies])
          .expect(401)
          .expect((res) => {
            expect(res.body.error.code).toBe('REFRESH_TOKEN_INVALID');
          });
      }

      await prisma.user.delete({ where: { id: created.id } });
    });
  });
});
