import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
