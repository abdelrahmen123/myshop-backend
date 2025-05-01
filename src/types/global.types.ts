import { HttpStatus } from '@nestjs/common';

export type ApiResponse<type> =
  | {
      status: HttpStatus;
      message: string;
      data: type;
    }
  | {
      status: HttpStatus;
      message: string;
    };
