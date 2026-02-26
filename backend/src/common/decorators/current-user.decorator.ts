import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LoginUserPayload } from '../../modules/auth/auth.service';

export const CurrentUser = createParamDecorator((data: keyof LoginUserPayload | undefined, ctx: ExecutionContext): LoginUserPayload | unknown => {
  const request = ctx.switchToHttp().getRequest<{ user: LoginUserPayload }>();
  const user = request.user;
  if (data && user) return user[data];
  return user;
});
