import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum AlertSettings {
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning'
}

export class Alert {
    id?: string;
    type: AlertSettings | undefined;
    message: string | undefined;

    constructor(init?: Partial<Alert>) {
        Object.assign(this, init);
    }
}

@Injectable({ providedIn: 'root' })
export class AlertService {
    private subject = new BehaviorSubject<Alert | null>(null);
    private defaultId = 'default-alert';
    private router = inject(Router);

    constructor() {}

    onAlert(id: string = this.defaultId): Observable<Alert> {
        return this.subject.asObservable().pipe(
            filter((x): x is Alert => x !== null && x.id === id)
        );
    }

    success(message: string, options?: Partial<Alert>): void {
        this.alert(new Alert({
            ...options,
            type: AlertSettings.SUCCESS,
            message
        }));
    }

    error(message: string, options?: Partial<Alert>): void {
        this.alert(new Alert({
            ...options,
            type: AlertSettings.ERROR,
            message
        }));
    }

    info(message: string, options?: Partial<Alert>): void {
        this.alert(new Alert({
            ...options,
            type: AlertSettings.INFO,
            message
        }));
    }

    warn(message: string, options?: Partial<Alert>): void {
        this.alert(new Alert({
            ...options,
            type: AlertSettings.WARNING,
            message
        }));
    }

    alert(alert: Alert): void {
        alert.id = alert.id || this.defaultId;
        this.subject.next(alert);
    }

    clear(id: string = this.defaultId): void {
        this.subject.next(new Alert({ id }));
    }

    /* Método opcional para limpiar alertas automáticamente en navegación
    private setupRouterListening(): void {
        this.router.events
            .pipe(
                filter(event => event instanceof 'NavigationStart')
            )
            .subscribe(() => {
                this.clear();
            });
    }
    */
}
