import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorFilter } from 'src/middleware/error.middleware';
import {
  CheckerResponse,
  LoginResponse,
  type TLogin,
  type TMessage,
} from 'src/types/types';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegistrationDto } from './dto/registration-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { MessageResponse } from 'src/types/classTypesForSwagger';

@UseFilters(ErrorFilter)
@ApiTags('User Authorization')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User registration' })
  @ApiCreatedResponse({
    description: 'User has successfully created.',
  })
  @ApiBadRequestResponse({ description: 'This email is already existed!' })
  @ApiInternalServerErrorResponse({
    description: 'An server error occurred when saving the new User.',
  })
  @Post('registration')
  @UsePipes(new ValidationPipe())
  registration(@Body() registrationDto: RegistrationDto): Promise<TMessage> {
    return this.authService.registration(registrationDto);
  }

  @ApiOperation({ summary: 'User Login' })
  @ApiOkResponse({
    description: 'The user has successfully logged in',
  })
  @ApiUnauthorizedResponse({ description: 'Incorrect authorization data.' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Post('login')
  @UsePipes(new ValidationPipe())
  @UseGuards(LocalAuthGuard)
  login(@Request() req, @Body() loginUserDto: LoginUserDto): Promise<TLogin> {
    return this.authService.login(req.user);
  }

  @ApiOperation({ description: 'Get profile and Check Token' })
  @ApiBearerAuth('Token')
  @ApiOkResponse({
    description: 'Profile has successfully got.',
  })
  @ApiUnauthorizedResponse({
    description: 'Need user token for getting profile and checking token',
  })
  @Get('checkTokenProfile')
  @UseGuards(JwtAuthGuard)
  checkUserToken(@Request() req) {
    return req.user;
  }
}
