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
import { ToastModule } from 'primeng/toast'; // <--- Importante para notificaciones
import { MessageService } from 'primeng/api'; // <--- Servicio de mensajes
import { UserRequest, UserResponse } from '../../../core/model/user/user';
import { UserService } from '../../../core/service/user/user.service';
import { TableModule } from "primeng/table";
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { Rol } from '../../../core/model/rol/rol';
import { RolService } from '../../../core/service/rol/rol.service';
import { firstValueFrom } from 'rxjs';
import { OptometristService } from '../../../core/service/optometrist/optometrist.service';
import { Optometrist } from '../../../core/model/optometrist/optometrist';
import { environment } from '../../../../environment/environment';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        InputTextModule,
        ButtonModule,
        FluidModule,
        DialogModule,
        CheckboxModule,
        ToastModule,
        TableModule,
        DropdownModule,
        PasswordModule
    ],
    providers: [MessageService], // <--- Proveedor del servicio de mensajes
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

    datosUsuario: UserResponse | null = null;
    crearUsuario: UserRequest = {} as UserRequest;
    datosOptometrista: Optometrist = {} as Optometrist;
    cargando = false;
    // Lista simulada de roles para el dropdown (luego vendrá de tu BD)
    listaRoles: Rol[] = [];
    listaUsuarios: UserResponse[] = [];
    estados = [
        { label: 'Activo', value: true },
        { label: 'Inactivo', value: false }
    ]

    constructor(
        private messageService: MessageService,
    ) { }

    userId = environment.userId;

    private userService = inject(UserService);
    private rolService = inject(RolService);
    private optometristService = inject(OptometristService);

    // Objeto para el formulario de crear usuario
    nuevoUsuario: any = {
        nombre: '',
        apellido: '',
        cedula: '',
        correo: '',
        clave: '',
        estado: true,
        idRol: null
    };

    ngOnInit() {
        this.cargarDatosUsuario();
        this.cargarRoles();
        this.cargarOptometrista(this.userId);
    }

    private async cargarDatosUsuario() {
        try {
            this.cargando = true;
            this.datosUsuario = await this.userService.getUserById(this.userId.toString());
            console.log('Datos del usuario cargados:', this.datosUsuario);
        } catch (error) {
            console.error('Error al cargar los datos del usuario:', error);
        } finally {
            this.cargando = false;
        }
    }

    private async cargarRoles() {
        try {
            this.cargando = true;
            this.listaRoles = await this.rolService.getRols().pipe().toPromise() as Rol[];
            console.log('Lista de roles cargados:', this.listaRoles);
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
            this.listaUsuarios = respuesta as UserResponse[];
        } catch (error) {
            console.error(error);
        } finally {
            this.cargando = false;
        }
    }

    private async cargarOptometrista(idUsuario: number) {
        try {
            this.cargando = true;
            this.datosOptometrista = await this.optometristService.getByUserId(this.userId);
            console.log('optometrista cargado:', this.datosOptometrista);
        } catch (error) {
            console.error('Error al optometrista:', error);
        } finally {
            this.cargando = false;
        }
    }


    // Variables para controlar la visibilidad de los diálogos
    displayCrearDialog: boolean = false;
    displayListarDialog: boolean = false;



    abrirCrearUsuario() {
        // Reseteamos el formulario al abrir
        this.nuevoUsuario = {
            nombre: '',
            apellido: '',
            cedula: '',
            correo: '',
            clave: '',
            estado: true,
            idRol: null
        };
        this.displayCrearDialog = true;
    }

    abrirListarUsuarios() {
        this.displayListarDialog = true;
        this.cargarListaUsuarios(); // Cargar la lista al abrir el modal
    }

    guardarUsuario() {
        // 1. VALIDACIÓN: Usamos 'this.nuevoUsuario' que es lo que el HTML está llenando
        if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.cedula || !this.nuevoUsuario.idRol) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Complete los campos obligatorios (Nombre, Cédula, Rol)' });
            return;
        }

        this.cargando = true;

        // 2. PREPARAR PAYLOAD
        // Aseguramos que el objeto coincida con lo que espera UserRequest
        const payload: UserRequest = {
            nombre: this.nuevoUsuario.nombre,
            apellido: this.nuevoUsuario.apellido,
            cedula: this.nuevoUsuario.cedula,
            correo: this.nuevoUsuario.correo,
            clave: this.nuevoUsuario.clave,
            estado: this.nuevoUsuario.estado,
            idRol: this.nuevoUsuario.idRol // El dropdown devuelve el ID numérico
        };

        // 3. ENVIAR AL BACKEND
        this.userService.saveUser(payload).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente' });

                this.displayCrearDialog = false; // Cerrar modal
                this.cargarListaUsuarios();      // Refrescar la lista de usuarios (si está abierta o se abre luego)
            },
            error: (err) => {
                console.error(err);
                // Manejo de error básico: si el backend envía un mensaje, mostrarlo
                const mensajeError = err.error?.message || 'Error al guardar el usuario. Verifique si la cédula o correo ya existen.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: mensajeError });
            },
            complete: () => {
                this.cargando = false;
            }
        });
    }

}
