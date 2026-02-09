import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Card } from "primeng/card";
import { environment } from '../../../environment/environment';
import { UserService } from '../../core/service/user/user.service';
import { AuthService } from '../../core/service/auth/auth.service';

@Component({
    selector: 'app-dashboard',
    imports: [Card, RouterModule, CommonModule],
    templateUrl: './dashboard.html',
})
export class Dashboard {
    nombreRol: string = '';
    cargando: boolean = true;

    // Inyección de dependencias
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private authService = inject(AuthService); // Solo necesitamos AuthService

    ngOnInit() {
        // Nos suscribimos al usuario actual.
        // Como es un BehaviorSubject, nos dará el valor inmediatamente si ya está logueado.
        this.authService.currentUser.subscribe(usuario => {
            if (usuario) {
                this.nombreRol = usuario.nombreRol;
                console.log('Rol detectado en Dashboard:', this.nombreRol);
            }

            // Terminamos la carga inmediatamente porque los datos ya estaban en memoria
            this.cargando = false;
        });
    }
}
