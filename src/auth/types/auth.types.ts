import { User } from '@prisma/client';
import { ApiResponse } from 'src/types/global.types';

export type SafeUserType = Omit<User, 'password'>;

export type AuthApiResponse = ApiResponse<SafeUserType>;
