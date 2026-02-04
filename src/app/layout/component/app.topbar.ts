import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { UserResponse } from '../../core/model/user/user';
import { UserService } from '../../core/service/user/user.service';
import { environment } from '../../../environment/environment';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <img src="assets/image/logoestesi-02.svg" alt="VeopTics Logo" style="height: 4rem; margin-right: 0.5rem;">
                <span>VeopTics</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
            </div>

            <!-- <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button> -->
             <div class="relative">
            </div>

            <div class="relative">
                <!-- Botón de perfil -->
                <button type="button" class="layout-topbar-action" pStyleClass="@next" enterFromClass="hidden"
                    enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true">
                    <i class="pi pi-user"></i>
                    <span>Perfil</span>
                </button>

                <!-- Overlay del perfil -->
                <div class="card absolute right-0 mt-2 min-w-64 rounded shadow-md p-4 text-center z-50 hidden
                                bg-white border border-black-200  dark:border-black-700">
                    <div
                        class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                        <i class="pi pi-user text-3xl text-gray-600 dark:text-gray-300 " style="font-size: 2.5rem"></i>
                    </div>


                    <!-- Nombre y cuenta -->
                    <h6 class="font-medium text-gray-900 dark:text-gray-100">{{ datosUsuario?.nombre }} {{ datosUsuario?.apellido }}</h6>
                    <div class="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-id-card text-gray-500"></i>
                            <span>Cedula: {{ datosUsuario?.cedula }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-envelope text-gray-500"></i>
                            <span>{{ datosUsuario?.correo }}</span>
                        </div>
                    </div>

                    <hr class="my-2 border-gray-200 dark:border-gray-700" />

                    <button pButton label="Perfil"
                        class="w-full px-3 py-2 text-center rounded-lg p-button text-sm font-medium transition"
                        (click)="irPerfil()">Perfil</button>
                    <div class="h-1"></div>
                    <button
                        class="w-full px-3 py-2 text-center rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
                        (click)="logout()">
                        <i class="pi pi-sign-out mr-2"></i> Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];

    private router = inject(Router);

    constructor(public layoutService: LayoutService) { }

    datosUsuario: UserResponse | null = null;
    cargando = false;

    private userService = inject(UserService);

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    irPerfil() {
        this.router.navigate(['/pages/perfil']);
    }

    logout() {
        this.router.navigate(['/auth/login']);
    }

    private async cargarDatosUsuario() {
        try {
            this.cargando = true;
            this.datosUsuario = await this.userService.getUserById(environment.userId.toString());
            console.log('Datos del usuario cargados:', this.datosUsuario);
        } catch (error) {
            console.error('Error al cargar los datos del usuario:', error);
        } finally {
            this.cargando = false;
        }
    }

    ngOnInit(): void {
        this.cargarDatosUsuario();
    }
}
