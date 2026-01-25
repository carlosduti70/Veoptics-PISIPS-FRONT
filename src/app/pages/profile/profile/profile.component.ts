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
        ToastModule // <--- Agregado
    ],
    providers: [MessageService], // <--- Proveedor del servicio de mensajes
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

    // Inyecciones
    // private authService = inject(AuthenticationService);
    // private socioService = inject(SociosService);
    // private updatePhoneService = inject(UpdatePhoneService);
    // private updateEmailService = inject(UpdateEmailService);
    // private messageService = inject(MessageService);

    // private locationService = inject(LocationService);


    // // Datos del Socio usando la Interfaz Real
    // socio: Socios = {};

    // listaPaises: Pais[] = [];
    // listaProvincias: Provincia[] = [];
    // listaCantones: Canton[] = [];
    // listaParroquias: Parroquia[] = [];

    // Variables para el Modal de Edición
    displayEditDialog: boolean = false;
    // editData: Socios = {}; // Copia temporal para editar

    // Variables para validación de actualización
    confirmValue: string = '';
    acceptTerms1: boolean = false;
    acceptTerms2: boolean = false;
    editFieldType: 'email' | 'phone' | null = null;

    // Estado de carga para el botón guardar
    loadingSave: boolean = false;

    ngOnInit() {
        // this.cargarDatosSocio();
        // this.cargarUbicacion();
    }

    // async cargarUbicacion() {
    //     try {
    //         // Ejecutamos todas las peticiones en paralelo para mayor velocidad
    //         const [paises, provincias, cantones, parroquias] = await Promise.all([
    //             this.locationService.getPais(),
    //             this.locationService.getProvincia(),
    //             this.locationService.getCanton(),
    //             this.locationService.getParroquia()
    //         ]);

    //         this.listaPaises = paises;
    //         this.listaProvincias = provincias;
    //         this.listaCantones = cantones;
    //         this.listaParroquias = parroquias;
    //     } catch (error) {
    //         console.error('Error al cargar catálogos', error);
    //     }
    // }

    // async cargarDatosSocio() {
    //     const token = this.authService.getToken();
    //     if (token) {
    //         try {
    //             const data = await this.socioService.getSocio(token);
    //             if (data) {
    //                 this.socio = data;
    //             }
    //         } catch (error) {
    //             console.error('Error cargando perfil', error);
    //         }
    //     }
    // }

    // obtenerNombrePais(codigo: any): string {
    //     if (!codigo || codigo === 0) return 'PENDIENTE';
    //     const paisEncontrado = this.listaPaises.find(p => p.codPais == codigo);
    //     return paisEncontrado ? paisEncontrado.nomPais : 'PENDIENTE';
    // }
    // obtenerNombreProvincia(codigo: any): string {
    //     if (!codigo || codigo === 0) return 'PENDIENTE';
    //     const provinciaEncontrada = this.listaProvincias.find(p => p.codProvincia == codigo);
    //     return provinciaEncontrada ? provinciaEncontrada.nomProvincia : 'PENDIENTE';
    // }
    // obtenerNombreCanton(codigo: any): string {
    //     if (!codigo || codigo === 0) return 'PENDIENTE';
    //     const cantonEncontrado = this.listaCantones.find(p => p.codCanton == codigo);
    //     return cantonEncontrado ? cantonEncontrado.nomCanton : 'PENDIENTE';
    // }
    // obtenerNombreParroquia(codigo: any): string {
    //     if (!codigo || codigo === 0) return 'PENDIENTE';
    //     const parroquiaEncontrada = this.listaParroquias.find(p => p.codParroquia == codigo);
    //     return parroquiaEncontrada ? parroquiaEncontrada.nomParroquia : 'PENDIENTE';
    // }


    // --- Lógica del Modal de Edición ---

    // abrirEdicion(campo: 'email' | 'phone') {
    //     this.editFieldType = campo;
    //     this.editData = { ...this.socio };
    //     this.confirmValue = '';
    //     this.acceptTerms1 = false;
    //     this.acceptTerms2 = false;
    //     this.displayEditDialog = true;
    // }

    // get isFormValid(): boolean {
    //     if (!this.acceptTerms1 || !this.acceptTerms2) return false;

    //     if (this.editFieldType === 'email') {
    //         return !!this.editData.dirCorreo && this.editData.dirCorreo === this.confirmValue;
    //     }
    //     if (this.editFieldType === 'phone') {
    //         // Validar que tenga 10 dígitos si es necesario
    //         return !!this.editData.telCelular &&
    //             this.editData.telCelular.length === 10 &&
    //             this.editData.telCelular === this.confirmValue;
    //     }
    //     return false;
    // }

    // async guardarCambios() {
    //     if (!this.isFormValid) return;

    //     this.loadingSave = true; // Activar spinner
    //     const token = this.authService.getToken();

    //     if (!token) {
    //         this.mostrarMensaje('error', 'Error', 'No se encontró la sesión activa');
    //         this.loadingSave = false;
    //         return;
    //     }

    //     try {
    //         if (this.editFieldType === 'phone') {
    //             // 1. Obtener datos para el servicio
    //             const antPhone = this.socio.telCelular || ''; // Si es null/undefined enviamos vacío
    //             const newPhone = this.editData.telCelular || '';

    //             // 2. Llamar al servicio
    //             const response = await this.updatePhoneService.updatePhone(token, antPhone, newPhone);

    //             // 3. Validar respuesta (Ajusta según lo que retorne tu backend exactamente)
    //             if (response && response.status === 1) {

    //                 // Actualizar vista localmente
    //                 this.socio.telCelular = newPhone;
    //                 this.mostrarMensaje('success', 'Éxito', 'Número celular actualizado correctamente');
    //                 this.displayEditDialog = false;

    //             } else {
    //                 this.mostrarMensaje('error', 'Error', response?.message || 'No se pudo actualizar el teléfono');
    //             }

    //         } else if (this.editFieldType === 'email') {
    //             const antEmail = this.socio.dirCorreo || '';
    //             const newEmail = this.editData.dirCorreo || '';

    //             // Llamar al servicio de actualización de correo electrónico
    //             const response = await this.updateEmailService.updateEmail(token, this.socio.codSocio || '', antEmail, newEmail);

    //             // Validar respuesta del servicio
    //             if (response && response.status === 1) {
    //                 this.socio.dirCorreo = newEmail;
    //                 this.mostrarMensaje('success', 'Éxito', 'Correo electrónico actualizado correctamente');
    //                 this.displayEditDialog = false;
    //             } else {
    //                 this.mostrarMensaje('error', 'Error', response?.message || 'No se pudo actualizar el correo electrónico');
    //             }
    //         }

    //     } catch (error: any) {
    //         console.error('Error al guardar:', error);
    //         this.mostrarMensaje('error', 'Error del Sistema', error.message || 'Ocurrió un problema al procesar la solicitud');
    //     } finally {
    //         this.loadingSave = false; // Desactivar spinner
    //     }
    // }

    // isPending(value: any): boolean {
    //     return value === null || value === undefined || value === '' || value === 'PENDIENTE';
    // }

    // // Helper para mensajes Toast
    // private mostrarMensaje(severity: string, summary: string, detail: string) {
    //     this.messageService.add({ severity, summary, detail, life: 3000 });
    // }
}
