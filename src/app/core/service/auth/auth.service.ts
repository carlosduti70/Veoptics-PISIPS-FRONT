import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { AlertService } from '../alert/alert.service';
import { environment } from '../../../../environment/environment';

export interface UsuarioSesion {
    idUsuario: number;
    nombre: string;
    apellido: string;
    cedula: string;
    correo: string;
    indicador: string;
    estado: boolean;
    nombreRol: string; // 'ADMIN', 'MEDICO', 'RECEPCIONISTA'
}


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private currentUserSubject: BehaviorSubject<UsuarioSesion | null>;
    public currentUser: Observable<UsuarioSesion | null>;

    // Inyecciones
    private _router = inject(Router);
    private http = inject(HttpClient);
    private _alertService = inject(AlertService);
    private ngZone = inject(NgZone);

    // --- VARIABLES PARA INACTIVIDAD ---
    private idleTimeout: any;
    private readonly INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 Minutos
    private eventListener: () => void;

    constructor() {
        // Recuperar usuario de localStorage al iniciar la app
        const storedUser = localStorage.getItem('currentUser');
        const parsedUser = storedUser ? (JSON.parse(storedUser) as UsuarioSesion) : null;

        this.currentUserSubject = new BehaviorSubject<UsuarioSesion | null>(parsedUser);
        this.currentUser = this.currentUserSubject.asObservable();

        // Listener para resetear el timer de inactividad
        this.eventListener = () => this.resetIdleTimer();

        // Si hay usuario logueado al recargar, activamos la vigilancia
        if (parsedUser) {
            this.startIdleWatcher();
        }
    }

    // ==========================================
    // LÓGICA DE LOGIN CONECTADA AL BACKEND
    // ==========================================

    login(correo: string, clave: string): Observable<UsuarioSesion> {

        // 1. Configuramos los parámetros que irán en la URL
        const params = new HttpParams()
            .set('correo', correo)
            .set('clave', clave);

        // 2. Hacemos el POST:
        // - 1er argumento: URL
        // - 2do argumento: null (porque no enviamos nada en el body)
        // - 3er argumento: opciones (aquí van los params)
        return this.http.post<UsuarioSesion>(
            `${environment.apiUrl}/usuario/login`,
            null,
            { params }
        ).pipe(
            tap(user => {
                if (user && user.idUsuario) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                    this.startIdleWatcher();
                }
            }),
            catchError(err => {
                let mensaje = 'Error al iniciar sesión';
                if (err.status === 401) {
                    mensaje = 'Credenciales incorrectas';
                } else if (err.status === 0) {
                    mensaje = 'No se puede conectar con el servidor';
                }
                // Asegúrate de que _alertService esté inyectado correctamente
                this._alertService.error(mensaje);
                return throwError(() => err);
            })
        );
    }

    logout(): void {
        // Limpiamos todo
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.stopWatchers();
        console.log('Usuario ha cerrado sesión.');
        this._router.navigate(['/auth/login']);
    }

    updatePassword(idUser: number, newPassword: string): Observable<any> {
        const params = new HttpParams()
            .set('idUsuario', idUser.toString()) // HttpParams requiere strings
            .set('nuevaClave', newPassword);

        // El segundo argumento es el BODY (vacío), el tercero son las OPCIONES
        return this.http.post(`${environment.apiUrl}/usuario/actualizarclave`, {}, { params });
    }

    // ==========================================
    // GETTERS Y UTILIDADES
    // ==========================================

    // Obtener valor actual sin suscribirse
    public get currentUserValue(): UsuarioSesion | null {
        return this.currentUserSubject.value;
    }

    // Verificar si tiene un rol específico (Útil para Guards)
    public hasRole(rol: string): boolean {
        const user = this.currentUserValue;
        return user ? user.nombreRol === rol : false;
    }

    // ==========================================
    // LÓGICA DE INACTIVIDAD (NGZONE)
    // ==========================================

    private startIdleWatcher() {
        // Ejecutamos fuera de Angular para no disparar la detección de cambios en cada mousemove
        this.ngZone.runOutsideAngular(() => {
            document.addEventListener('mousemove', this.eventListener);
            document.addEventListener('click', this.eventListener);
            document.addEventListener('keypress', this.eventListener);
            document.addEventListener('scroll', this.eventListener);
            document.addEventListener('touchstart', this.eventListener);
        });

        this.resetIdleTimer();
    }

    private resetIdleTimer() {
        if (this.idleTimeout) clearTimeout(this.idleTimeout);

        // Si pasan 10 minutos sin actividad -> Logout
        this.idleTimeout = setTimeout(() => {
            this.ngZone.run(() => {
                console.log('Cerrando sesión por inactividad (10 min).');
                this._alertService.info('Sesión cerrada por inactividad.');
                this.logout();
            });
        }, this.INACTIVITY_LIMIT);
    }

    private stopWatchers() {
        if (this.idleTimeout) clearTimeout(this.idleTimeout);

        document.removeEventListener('mousemove', this.eventListener);
        document.removeEventListener('click', this.eventListener);
        document.removeEventListener('keypress', this.eventListener);
        document.removeEventListener('scroll', this.eventListener);
        document.removeEventListener('touchstart', this.eventListener);
    }
}
