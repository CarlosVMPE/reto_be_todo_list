import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '../shared/constants';

describe('AuthService', () => {
  let service: AuthService;
  let model: Model<User>;
  let jwtService: JwtService;

  const mockUser = {
    _id: '75e8d0873fa70cecd1fabae3',
    name: 'Test',
    email: 'test@gmail.com',
  };

  const mockAuthService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const token = 'jwtToken';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        { provide: getModelToken(User.name), useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto = {
      name: 'Test',
      email: 'test@gmail.com',
      password: '12345678',
    };

    it('should register the new user', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockUser) as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');

      const result = await service.signUp(signUpDto);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).toEqual({
        token,
        user: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should throw duplicate email entered', async () => {
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.reject({ code: 11000 }) as any);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw duplicate email entered 2', async () => {
      jest.spyOn(model, 'create').mockRejectedValueOnce(
        new BadRequestException(ERROR_MESSAGES.ERROR_400, {
          cause: new Error(),
          description: 'Some error description',
        }),
      );

      expect(await service.signUp(signUpDto)).toEqual(
        new BadRequestException(ERROR_MESSAGES.ERROR_400, {
          cause: new Error(),
          description: 'Some error description',
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@gmail.com',
      password: '12345678',
    };

    it('should login user and return the token', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
      const result = await service.login(loginDto);
      expect(result).toEqual({
        token,
        user: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should throw invalid email error', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);

      expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw invalid password error', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
      expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
