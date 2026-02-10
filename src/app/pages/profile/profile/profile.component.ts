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
import { UserRequest, UserUpdate } from '../../../core/model/user/user'; // UserResponse ya no es necesario importarlo de aquí si usas UsuarioSesion
import { UserService } from '../../../core/service/user/user.service';
import { Rol } from '../../../core/model/rol/rol';
import { RolService } from '../../../core/service/rol/rol.service';
import { OptometristService } from '../../../core/service/optometrist/optometrist.service';
import { Optometrist } from '../../../core/model/optometrist/optometrist';
import { AuthService, UsuarioSesion } from '../../../core/service/auth/auth.service'; // <--- IMPORTANTE
import Swal from 'sweetalert2';

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
    listaUsuarios: any[] = [];
    estados = [
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ]
    submitted: boolean = false;
    esEdicion: boolean = false;

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
    private authService = inject(AuthService);

    constructor() { }

    ngOnInit() {
        this.authService.currentUser.subscribe(user => {
            this.datosUsuario = user;

            if (this.datosUsuario) {
                this.cargarOptometrista(this.datosUsuario.idUsuario);
            }
        });

        this.cargarRoles();
    }

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

            if (error.status !== 404 && error.status !== 500) {
            }
        } finally {
            this.cargando = false;
        }
    }

    abrirRegistroOptometrista() {
        if (!this.datosUsuario) return;

        this.nuevoOptometrista = {
            registroProfesional: '',
            telefono: '',
            estado: 'A',
            idUsuario: this.datosUsuario.idUsuario
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

    backendErrors: any = {
        cedula: '',
        correo: '',
        telefono: ''
    };

    abrirCrearUsuario() {
        this.esEdicion = false;
        this.nuevoUsuario = {
            nombre: '', apellido: '', cedula: '', correo: '', clave: '', estado: true, idRol: null
        };
        this.backendErrors = { cedula: '', correo: '', telefono: '' };
        this.displayCrearDialog = true;
        this.submitted = false;
    }

    abrirEditarUsuario(usuario: any) {
        this.esEdicion = true; // Modo Edición
        this.submitted = false;
        this.backendErrors = { cedula: '', correo: '', telefono: '' };

        const rolEncontrado = this.listaRoles.find(
            r => r.nombreRol === usuario.nombreRol
        );

        this.nuevoUsuario = {
            idUsuario: usuario.idUsuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            cedula: usuario.cedula,
            correo: usuario.correo,
            clave: '',
            estado: usuario.estado,
            idRol: rolEncontrado ? rolEncontrado.idRol : null
        };

        this.displayCrearDialog = true;
    }

    abrirListarUsuarios() {
        this.displayListarDialog = true;
        this.cargarListaUsuarios();
    }

    guardarUsuario() {
        this.submitted = true;
        this.backendErrors = { cedula: '', correo: '', telefono: '' };

        // Validaciones básicas
        // En edición NO validamos clave, en creación SÍ
        if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.cedula || !this.nuevoUsuario.idRol) {
            return;
        }
        if (!this.esEdicion && !this.nuevoUsuario.clave) {
            return; // Si es creación y no hay clave, salir
        }

        this.cargando = true;

        if (this.esEdicion) {
            // ================= LÓGICA DE ACTUALIZACIÓN =================
            const payload: UserUpdate = {
                idUsuario: this.nuevoUsuario.idUsuario,
                nombre: this.nuevoUsuario.nombre,
                apellido: this.nuevoUsuario.apellido,
                cedula: this.nuevoUsuario.cedula,
                correo: this.nuevoUsuario.correo,
                estado: this.nuevoUsuario.estado,
                idRol: this.nuevoUsuario.idRol
            };

            this.userService.updateUser(payload).subscribe({
                next: () => {
                    this.displayCrearDialog = false;
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente.' });
                    this.cargarListaUsuarios();
                },
                error: (err) => this.manejarErroresBackend(err), // Reutilizamos lógica de error
                complete: () => this.cargando = false
            });

        } else {
            // ================= LÓGICA DE CREACIÓN (La que ya tenías) =================
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
                next: () => {
                    Swal.fire('¡Creado!', `El usuario ${this.nuevoUsuario.nombre} ha sido creado.`, 'success');
                    this.displayCrearDialog = false;
                    this.cargarListaUsuarios();
                },
                error: (err) => this.manejarErroresBackend(err),
                complete: () => this.cargando = false
            });
        }
    }

    private manejarErroresBackend(err: any) {
        this.cargando = false;
        const mensaje = err.error?.mensaje || '';

        if (mensaje.toLowerCase().includes('cédula')) {
            this.backendErrors.cedula = mensaje;
        } else if (mensaje.toLowerCase().includes('correo')) {
            this.backendErrors.correo = mensaje;
        } else {
            Swal.fire('Error', mensaje || 'Error al procesar la solicitud', 'error');
        }
    }
}
