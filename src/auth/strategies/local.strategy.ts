import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, UseFilters } from '@nestjs/common';
import { User } from 'src/user/schema/user.schema';
import { AuthService } from '../auth.service';
import { ErrorFilter } from 'src/middleware/error.middleware';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }
  async validate(email: string, password: string): Promise<User | undefined> {
    return await this.authService.validateUser(email, password);
  }
}
