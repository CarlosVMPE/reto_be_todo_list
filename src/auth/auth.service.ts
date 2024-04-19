import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ERROR_MESSAGES } from '../shared/constants';
import { exceptionFn } from '../shared/utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ token: string; user }> {
    const { name, email, password } = signUpDto;
    const hashedPssword = await bcrypt.hash(password, 10);

    try {
      const user = await this.userModel.create({
        name,
        email,
        password: hashedPssword,
      });

      const token = this.jwtService.sign({ id: user._id });
      const userRes = { id: user._id, name: user.name, email: user.email };

      return { token, user: userRes };
    } catch (error) {
      if (error?.code === 11000) {
        throw new ConflictException(ERROR_MESSAGES.ERROR_11000);
      }
      return exceptionFn(error?.status) as any;
    }
  }

  async login(loginDto: LoginDto): Promise<{ token: string; user }> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.ERROR_EMAIL_PWD);
    }

    const isPasswordMath = await bcrypt.compare(password, user.password);

    if (!isPasswordMath) {
      throw new UnauthorizedException(ERROR_MESSAGES.ERROR_EMAIL_PWD);
    }

    const token = this.jwtService.sign({ id: user._id });
    const userRes = { id: user._id, name: user.name, email: user.email };
    return { token, user: userRes };
  }
}
