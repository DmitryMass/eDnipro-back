import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import * as bcrypt from 'bcryptjs';
import type { TLogin, TMessage } from 'src/types/types';
import { RegistrationDto } from './dto/registration-user.dto';
import { randomColorPick } from 'src/utils/randomColorPicker';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registration(registrationDto: RegistrationDto): Promise<TMessage> {
    const { email, password } = registrationDto;
    const user = await this.userModel.findOne({ email });

    if (user) {
      throw new BadRequestException('This email is already existed!');
    }

    const userBackground = randomColorPick();
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);

      await this.userModel.create({
        email,
        password: hashedPass,
        userBackground,
      });
      return { message: 'Registration has successfully' };
    } catch (err) {
      throw new InternalServerErrorException(
        'An error occurred when saving the new User.',
      );
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({
      email,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const passwordIsMatch = await bcrypt.compare(password, user.password);

    if (user && passwordIsMatch) {
      return user;
    } else {
      throw new UnauthorizedException('Incorrect User Data!');
    }
  }

  async login(user: User): Promise<TLogin> {
    const { id, email, firstName, lastName, userBackground } = user;
    return {
      id,
      email,
      firstName,
      lastName,
      userBackground,
      token: this.jwtService.sign({
        id: id,
        email: email,
        firstName,
        lastName,
        userBackground,
      }),
    };
  }
}
