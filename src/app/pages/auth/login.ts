import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para *ngIf
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/service/auth/auth.service';
import { MessageModule } from 'primeng/message'; // Asegúrate de importar MessageModule

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        PasswordModule,
        FormsModule,
        RouterModule,
        RippleModule,
        AppFloatingConfigurator,
        ToastModule,
        MessageModule // Cambiado de Message a MessageModule para p-message
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">

                        <div class="text-center mb-8 flex flex-col items-center">
                            <img src="assets/image/logoestesi-02.svg" alt="VeopTics Logo" class="mx-auto" style="width: 20rem; display: block;">
                            <span class="text-muted-color font-medium">Inicia Sesión para continuar</span>
                        </div>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Usuario (Correo)</label>
                            <input pInputText id="email1" type="text" placeholder="ejemplo@veoptics.com"
                                class="w-full md:w-[30rem] mb-8"
                                [(ngModel)]="user"
                                (keydown.enter)="onLogin()" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Contraseña</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Contraseña"
                                [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"
                                (keydown.enter)="onLogin()"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8"></div>

                            <p-button label="Iniciar Sesión"
                                styleClass="w-full"
                                [loading]="loading"
                                (onClick)="onLogin()"></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {

    user: string = '';
    password: string = '';
    loading: boolean = false;
    errorMessage: string = ''; // Aquí guardaremos el mensaje del backend

    private authService = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    onLogin() {
        // 1. Limpiar errores previos
        this.errorMessage = '';
        this.messageService.clear();

        if (!this.user || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingrese usuario y contraseña' });
            return;
        }

        this.loading = true;

        this.authService.login(this.user, this.password).subscribe({
            next: (userData) => {
                this.loading = false;
                this.router.navigate(['/']);

            },
            error: (err) => {
                this.loading = false;
                console.log('Error completo:', err); // Para depuración

                // LÓGICA DE EXTRACCIÓN DEL MENSAJE DEL BACKEND
                if (err.error && err.error.detalle) {
                    // Caso: El backend respondió con el JSON esperado
                    this.errorMessage = err.error.detalle;

                    // Opcional: También mostrar Toast
                    this.messageService.add({ severity: 'error', summary: 'Error de Acceso', detail: err.error.detalle });

                } else if (err.status === 401) {
                    // Caso: 401 pero sin JSON (fallback)
                    this.errorMessage = 'Credenciales incorrectas';

                } else if (err.status === 0) {
                    // Caso: Servidor apagado
                    this.errorMessage = 'No se pudo conectar con el servidor';

                } else {
                    // Otros errores
                    this.errorMessage = 'Ocurrió un error inesperado';
                }
            }
        });
    }
}
