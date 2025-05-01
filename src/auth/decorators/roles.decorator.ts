import { Reflector } from '@nestjs/core';

export const RolesDecorator = Reflector.createDecorator<string[]>();
