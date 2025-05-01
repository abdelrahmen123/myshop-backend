import { Request } from 'express';
import { SafeUserType } from 'src/auth/types/auth.types';

export interface UserRequest extends Request {
  user: SafeUserType;
}
