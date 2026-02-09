import { inject, Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';

import { AuthService } from '../service/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    // Inyectamos los servicios necesarios
    const authService = inject(AuthService);
    const router = inject(Router);

    // Verificamos si existe un usuario logueado (usando el getter que ya tienes)
    if (authService.currentUserValue) {
        return true; // Deja pasar
    } else {
        // Si no hay usuario, redirige al login
        router.navigate(['/auth/login']);
        return false; // Bloquea el paso
    }
};
