import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../../core/service/auth/auth.service';


@Component({
    selector: 'app-update-password',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        PasswordModule,
        InputTextModule,
        RippleModule,
        ToastModule,
        AppFloatingConfigurator
    ],
    templateUrl: './update-password.component.html',
    providers: [MessageService]
})
export class UpdatePasswordComponent implements OnInit {

    newPassword: string = '';
    confirmPassword: string = '';
    loading: boolean = false;
    idUser: number = 0;

    private authService = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    ngOnInit(): void {
        const state = history.state;

        if (state && state.idUser) {
            this.idUser = state.idUser;
            console.log('ID Usuario recibido:', this.idUser);
        } else {
            this.showError('Sesión no válida. Inicie sesión nuevamente.');
            this.router.navigate(['/auth/login']);
        }
    }

    onUpdatePassword() {
        if (!this.newPassword || !this.confirmPassword) {
            this.showError('Por favor complete todos los campos.');
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.showError('Las contraseñas no coinciden.');
            return;
        }

        this.loading = true;

        this.authService.updatePassword(this.idUser, this.newPassword).subscribe({
            next: (res) => { // Cambié el nombre a 'res' para mayor claridad
                this.loading = false;
                console.log('Respuesta real del backend:', res);

                // CAMBIO: Validamos si existe la propiedad 'mensaje' que vimos en tu imagen
                if (res && res.mensaje) {
                    // Usamos el mensaje que viene del servidor
                    this.showSuccess(res.mensaje);

                    // Limpiamos el token temporal si es necesario
                    localStorage.removeItem('token');

                    // REDIRECCIÓN
                    setTimeout(() => {
                        this.router.navigate(['/auth/login']);
                    }, 2000);
                } else {
                    // Fallback por si la respuesta no tiene el formato esperado
                    this.showError('La respuesta del servidor no es válida.');
                }
            },
            error: (err) => {
                this.loading = false;
                console.error('Error en la petición:', err);
                this.showError('Error de conexión o de servidor.');
            }
        });
    }

    private showSuccess(message: string) {
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: message,
            life: 3000
        });
    }

    private showError(message: string) {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 5000
        });
    }

    goBack() {
        localStorage.removeItem('token');
        this.router.navigate(['/auth/login']);
    }
}
