import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notification = inject(NotificationService);

  const token = authService.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        notification.error('Sessão expirada. Faça login novamente.');
      } else if (error.status === 403) {
        notification.error('Você não tem permissão para realizar esta ação.');
      } else if (error.status === 0) {
        notification.error('Não foi possível conectar ao servidor.');
      } else {
        const message = error.error?.message ?? 'Ocorreu um erro inesperado.';
        notification.error(message);
      }
      return throwError(() => error);
    })
  );
};
