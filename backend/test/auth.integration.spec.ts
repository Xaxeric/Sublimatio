import { INestApplication, Injectable, Module, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * HTTP-level proof of the auth contract. Prisma is replaced with an in-memory
 * delegate mock, so the suite runs without the live database; bcrypt and JWT
 * are real. The live DB, helmet and throttler are exercised with curl instead.
 *
 * @nestjs/throttler ships CJS while Nest 12 is ESM; Jest's ESM loader cannot
 * require @nestjs/common from inside it, so the module is mocked here only.
 */
describe('Auth + JWT guard (e2e, mocked Prisma)', () => {
  let AppModule: typeof import('../src/app.module').AppModule;
  let app: INestApplication<App>;
  let users: any[];
  let payloads: any[];

  const prismaMock = {
    user: {
      findUnique: jest.fn(async ({ where }: any) => {
        return (
          users.find((u) =>
            where.id ? u.id === where.id : u.email === where.email,
          ) ?? null
        );
      }),
      create: jest.fn(async ({ data }: any) => {
        const user = { id: `user-${users.length + 1}`, ...data };
        users.push(user);
        return user;
      }),
    },
    payload: {
      findFirst: jest.fn(async () => null),
      findUnique: jest.fn(async () => null),
      findMany: jest.fn(async () => payloads),
      create: jest.fn(async ({ data }: any) => data),
      update: jest.fn(async ({ data }: any) => data),
      delete: jest.fn(async () => ({})),
      count: jest.fn(async () => payloads.length),
    },
  };

  beforeAll(async () => {
    await jest.unstable_mockModule('@nestjs/throttler', () => {
      @Injectable()
      class ThrottlerGuard {
        canActivate(): boolean {
          return true;
        }
      }

      @Module({})
      class ThrottlerModule {
        static forRoot() {
          return {
            module: ThrottlerModule,
            providers: [ThrottlerGuard],
            exports: [ThrottlerGuard],
          };
        }
      }

      const Throttle = () => () => undefined;
      return { ThrottlerModule, ThrottlerGuard, Throttle };
    });
    ({ AppModule } = await import('../src/app.module'));
  });

  beforeEach(async () => {
    users = [];
    payloads = [];
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  async function registerAndLogin(): Promise<string> {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'student@example.com',
        name: 'Student',
        password: 'password123',
      })
      .expect(201);
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student@example.com', password: 'password123' })
      .expect(200);
    return response.body.accessToken;
  }

  it('register stores a hash and return body contains no password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'student@example.com',
        name: 'Student',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toEqual({
      id: 'user-1',
      email: 'student@example.com',
      name: 'Student',
    });
    expect(users[0].password).not.toBe('password123');
    expect(users[0].password).toMatch(/^\$2[aby]\$/);
  });

  it('login returns accessToken and rejects wrong password with 401', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'student@example.com',
      name: 'Student',
      password: 'password123',
    });

    const ok = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student@example.com', password: 'password123' })
      .expect(200);
    expect(typeof ok.body.accessToken).toBe('string');

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student@example.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('protected routes reject missing and invalid tokens', async () => {
    await request(app.getHttpServer()).get('/payloads').expect(401);
    await request(app.getHttpServer())
      .get('/payloads')
      .set('Authorization', 'Bearer not-a-jwt')
      .expect(401);
  });

  it('protected routes accept a valid Bearer token, including stats/count', async () => {
    const token = await registerAndLogin();

    await request(app.getHttpServer())
      .get('/payloads')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect([]);
    await request(app.getHttpServer())
      .get('/payloads/stats/count')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({ count: 0 });
  });
});
