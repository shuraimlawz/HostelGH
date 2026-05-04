import { AuthGuard } from "@nestjs/passport";
import { Injectable, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../../common/decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const handlerName = context.getHandler().name;
    console.log(`[JwtAuthGuard] Checking route: ${handlerName}, isPublic: ${isPublic}`);

    if (isPublic) {
      console.log(`[JwtAuthGuard] Entering public logic for: ${handlerName}`);
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization;
      console.log(`[JwtAuthGuard] Public route token present: ${!!token}`);
      
      try {
        const result = await super.canActivate(context);
        console.log(`[JwtAuthGuard] Public super.canActivate result for ${handlerName}: ${result}`);
        if (request.user) {
          console.log(`[JwtAuthGuard] User populated for public route: ${request.user.id}, role: ${request.user.role}`);
        }
      } catch (err) {
        console.log(`[JwtAuthGuard] Optional JWT failed for public route ${handlerName}: ${(err as any).message}`);
      }
      return true;
    }

    console.log(`[JwtAuthGuard] Entering private logic for: ${handlerName}`);
    try {
        const result = await super.canActivate(context);
        console.log(`[JwtAuthGuard] Private super.canActivate result for ${handlerName}: ${result}`);
        return result as boolean;
    } catch (err) {
        console.log(`[JwtAuthGuard] Private auth failed for ${handlerName}: ${(err as any).message}`);
        throw err;
    }
  }
}
