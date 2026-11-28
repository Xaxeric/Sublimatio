import { UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let users: any[];

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
        const user = { id: 'user-1', createdAt: new Date(), ...data };
        users.push(user);
        return user;
      }),
    },
  };

  beforeEach(async () => {
    users = [];
    prismaMock.user.findUnique.mockClear();
    prismaMock.user.create.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [AuthService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('register() stores a bcrypt hash, never the plaintext password', async () => {
    const result = await service.register({
      email: 'student@example.com',
      name: 'Student',
      password: 'password123',
    });

    expect(result).toEqual({
      id: 'user-1',
      email: 'student@example.com',
      name: 'Student',
    });
    expect(result).not.toHaveProperty('password');
    expect(users).toHaveLength(1);
    const stored = users[0].password;
    expect(stored).not.toBe('password123');
    expect(stored).toMatch(/^\$2[aby]\$/);
    expect(await bcrypt.compare('password123', stored)).toBe(true);
  });

  it('login() compares the hash and returns a verifiable accessToken', async () => {
    await service.register({
      email: 'student@example.com',
      name: 'Student',
      password: 'password123',
    });

    const result = await service.login({
      email: 'student@example.com',
      password: 'password123',
    });

    expect(result.user).toEqual({
      id: 'user-1',
      email: 'student@example.com',
      name: 'Student',
    });
    expect(typeof result.accessToken).toBe('string');
    expect(jwtService.verify(result.accessToken)).toMatchObject({
      sub: 'user-1',
      email: 'student@example.com',
    });
    expect(JSON.stringify(result)).not.toContain(users[0].password);
  });

  it('login() rejects a wrong password with 401', async () => {
    await service.register({
      email: 'student@example.com',
      name: 'Student',
      password: 'password123',
    });

    await expect(
      service.login({
        email: 'student@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login() rejects an unknown email with 401', async () => {
    await expect(
      service.login({
        email: 'nobody@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
