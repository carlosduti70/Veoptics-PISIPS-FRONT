import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from "primeng/table";
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { firstValueFrom } from 'rxjs';

// Modelos y Servicios
import { UserRequest } from '../../../core/model/user/user'; // UserResponse ya no es necesario importarlo de aquí si usas UsuarioSesion
import { UserService } from '../../../core/service/user/user.service';
import { Rol } from '../../../core/model/rol/rol';
import { RolService } from '../../../core/service/rol/rol.service';
import { OptometristService } from '../../../core/service/optometrist/optometrist.service';
import { Optometrist } from '../../../core/model/optometrist/optometrist';
import { AuthService, UsuarioSesion } from '../../../core/service/auth/auth.service'; // <--- IMPORTANTE

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CardModule, InputTextModule, ButtonModule,
        FluidModule, DialogModule, CheckboxModule, ToastModule, TableModule,
        DropdownModule, PasswordModule
    ],
    providers: [MessageService],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

    // Variables
    datosUsuario: UsuarioSesion | null = null; // Usamos la interfaz del AuthService
    datosOptometrista: Optometrist | null = null;
    cargando = false;

    listaRoles: Rol[] = [];
    listaUsuarios: any[] = []; // Ajustado a any o UserResponse según lo que devuelva tu API de listar
    estados = [
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ]

    // Variables de control de diálogos
    displayCrearDialog: boolean = false;
    displayListarDialog: boolean = false;
    displayOptometristaDialog: boolean = false;

    // Objetos para formularios
    nuevoUsuario: any = {
        nombre: '', apellido: '', cedula: '', correo: '', clave: '', estado: true, idRol: null
    };
    nuevoOptometrista: Optometrist = {} as Optometrist;

    // Inyecciones
    private messageService = inject(MessageService);
    private userService = inject(UserService);
    private rolService = inject(RolService);
    private optometristService = inject(OptometristService);
    private authService = inject(AuthService); // <--- Inyectamos AuthService

    constructor() { }

    ngOnInit() {
        // 1. Obtener datos del usuario desde la sesión actual
        // Nos suscribimos para reaccionar si cambian, o tomamos el valor actual
        this.authService.currentUser.subscribe(user => {
            this.datosUsuario = user;

            if (this.datosUsuario) {
                // Una vez tenemos el usuario, cargamos sus datos específicos
                // Nota: Usamos datosUsuario.idUsuario en lugar de environment.userId
                this.cargarOptometrista(this.datosUsuario.idUsuario);
            }
        });

        this.cargarRoles();
    }

    // ELIMINADO: private async cargarDatosUsuario() { ... }
    // Ya no es necesario porque los datos vienen del Login

    private async cargarRoles() {
        try {
            this.cargando = true;
            this.listaRoles = await this.rolService.getRols().pipe().toPromise() as Rol[];
        } catch (error) {
            console.error('Error al cargar los roles:', error);
        } finally {
            this.cargando = false;
        }
    }

    private async cargarListaUsuarios() {
        try {
            this.cargando = true;
            const respuesta = await firstValueFrom(this.userService.getUsers());
            this.listaUsuarios = respuesta as any[];
        } catch (error) {
            console.error(error);
        } finally {
            this.cargando = false;
        }
    }

    private async cargarOptometrista(idUsuario: number) {
        try {
            this.cargando = true;
            this.datosOptometrista = await this.optometristService.getByUserId(idUsuario);
        } catch (error: any) {
            console.error('Error capturado:', error);
            this.datosOptometrista = null;

            // Solo mostramos error si es algo grave, no si simplemente "no existe" (404)
            if (error.status !== 404 && error.status !== 500) {
                // Opcional: Manejar errores silenciosamente o mostrar mensaje
            }
        } finally {
            this.cargando = false;
        }
    }

    abrirRegistroOptometrista() {
        if (!this.datosUsuario) return;

        // Inicializamos el formulario con el ID del usuario logueado
        this.nuevoOptometrista = {
            registroProfesional: '',
            telefono: '',
            estado: 'A',
            idUsuario: this.datosUsuario.idUsuario // Usamos el ID de la sesión
        };
        this.displayOptometristaDialog = true;
    }

    guardarOptometrista() {
        if (!this.nuevoOptometrista.registroProfesional || !this.nuevoOptometrista.telefono) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Complete los campos obligatorios.' });
            return;
        }

        this.cargando = true;

        this.optometristService.saveOptometrist(this.nuevoOptometrista).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Datos guardados.' });
                this.displayOptometristaDialog = false;

                // Recargamos usando el ID de la sesión
                if (this.datosUsuario) {
                    this.cargarOptometrista(this.datosUsuario.idUsuario);
                }
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar.' });
                this.cargando = false;
            },
            complete: () => {
                this.cargando = false;
            }
        });
    }

    // ... (El resto de métodos abrirCrearUsuario, abrirListarUsuarios, guardarUsuario quedan IGUAL) ...

    abrirCrearUsuario() {
        this.nuevoUsuario = {
            nombre: '', apellido: '', cedula: '', correo: '', clave: '', estado: true, idRol: null
        };
        this.displayCrearDialog = true;
    }

    abrirListarUsuarios() {
        this.displayListarDialog = true;
        this.cargarListaUsuarios();
    }

    guardarUsuario() {
        // ... (Tu lógica original se mantiene intacta) ...
        if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.cedula || !this.nuevoUsuario.idRol) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Complete los campos obligatorios' });
            return;
        }

        this.cargando = true;

        // ... construir payload ...
        const payload: UserRequest = {
            nombre: this.nuevoUsuario.nombre,
            apellido: this.nuevoUsuario.apellido,
            cedula: this.nuevoUsuario.cedula,
            correo: this.nuevoUsuario.correo,
            clave: this.nuevoUsuario.clave,
            estado: this.nuevoUsuario.estado,
            idRol: this.nuevoUsuario.idRol
        };

        this.userService.saveUser(payload).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado' });
                this.displayCrearDialog = false;
                this.cargarListaUsuarios();
            },
            error: (err) => {
                const mensaje = err.error?.message || 'Error al guardar';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
                this.cargando = false;
            },
            complete: () => {
                this.cargando = false;
            }
        });
    }
}
