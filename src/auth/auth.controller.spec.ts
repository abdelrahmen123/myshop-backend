/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SafeUserType } from './types/auth.types';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const user: SafeUserType = {
    name: 'name',
    email: 'email',
    role: 'USER',
    id: '1',
    image: null,
    phone: null,
    address: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(() => Promise.resolve({ accessToken: 'token' })),
            register: jest.fn(() => Promise.resolve(user)),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('authController should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register()', () => {
    it('should register a new user', async () => {
      const result = await authController.register({
        name: 'name',
        email: 'email',
        password: 'password',
        role: 'USER',
      });

      expect(result).toMatchObject(user);
    });
  });

  describe('login()', () => {
    it('should return token', async () => {
      // @ts-ignore
      const result = await authController.login(user);

      // @ts-ignore
      expect(result.accessToken).toBe('token');
    });
  });
});
