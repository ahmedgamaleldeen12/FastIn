import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { from } from 'rxjs';
import { catchError, finalize, switchMap, tap, timeout } from 'rxjs/operators';
import { ToastController } from '@ionic/angular/standalone';
import { LoadingService } from '../loader/loader.service';
import { TokenService } from '../auth/token.service';
import { TranslationService } from '../localization/translation.service';
import { IonicStorageService } from '../storage/ionic-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt/lib/jwthelper.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);
const oldToken = '';

export const ionicTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const storage = inject(IonicStorageService);
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const localize = inject(TranslationService);
  const toastCtrl = inject(ToastController);

  const intercept = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    return from(storage.get('inquiry-token')).pipe(
      switchMap((token: any) => {
        token = token?.value;
        const clonedRequest = addToken(request, token, localize.lang);

        if (!clonedRequest.headers.has('Content-Type')) {
          request = clonedRequest.clone({ headers: clonedRequest.headers.set('Content-Type', 'application/json') });
        }

        return handleRequest(clonedRequest, next).pipe(
          catchError((error) => handleError(error, request, next)),
          finalize(() => {
            // Any finalization steps
          })
        );
      })
    );
  };

  const handleRequest = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    return next(request).pipe(
      timeout(30000),
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Success handling
        }
      }),
      catchError((error: HttpErrorResponse) => handleError(error, request, next)),
      finalize(() => {
        // Hide loader or other final tasks
      })
    );
  };

  const handleError = (error: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    if (error.status === 401 && !isRefreshing) {
      return handle401Error(request, next);
    } else {
      return throwError(() => error);
    }
  };

  const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return from(tokenService.refreshToken()).pipe(
        switchMap((token: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(token.token);
          const newRequest = addToken(request, token.token);
          return next(newRequest);
        }),
        catchError(() => {
          tokenService.removeTokens();
          router.navigate(['/login']);
          return throwError(() => new Error('Unauthorized'));
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        switchMap(token => {
          const newRequest = addToken(request, token);
          return next(newRequest);
        })
      );
    }
  };

  const addToken = (request: HttpRequest<any>, token: any, lang?: string) => {
    if(request.url.includes('googleapis')){
      return request.clone({setHeaders: {}});  
    }
    return request.clone({setHeaders: {Authorization: `Bearer ${token}`,lang: lang ? lang : 'en-US'}});
  };

  return intercept(req, next);
};