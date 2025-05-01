import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthApiResponse } from './types/auth.types';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiResponse } from 'src/types/global.types';
import { UserRequest } from 'src/user/user.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  public login(@Request() req: UserRequest): Promise<
    ApiResponse<{
      accessToken: string;
    }>
  > {
    return this.authService.login(req.user);
  }

  @Post('register')
  public register(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    registerDto: RegisterDto,
  ): Promise<AuthApiResponse> {
    return this.authService.register(registerDto);
  }

  // TODO => implement reset password
}
