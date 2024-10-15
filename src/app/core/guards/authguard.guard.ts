import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../auth/token.service';




export const authguardGuard: CanActivateFn = async (route, state) => {
  const tokenService  = inject(TokenService);
  const router = inject(Router);
  if (await tokenService.isLoggedIn()) {
    return true;
  } else {
    tokenService.removeTokens();
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
};
