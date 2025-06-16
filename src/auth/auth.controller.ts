import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthApiResponse } from './types/auth.types';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiResponse } from 'src/types/global.types';
import { UserRequest } from 'src/user/user.types';
import { ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({
    type: LoginDto,
  })
  public login(
    @Request() req: UserRequest,
    @Res() res: Response,
  ): Promise<
    ApiResponse<{
      accessToken: string;
    }>
  > {
    return this.authService.login(req.user, res);
  }

  @Post('logout')
  public logout(@Res() res: Response): Promise<void> {
    return this.authService.logout(res);
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
