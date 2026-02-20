import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FluidModule } from 'primeng/fluid';

// Model & Service
import { Patient, PatientUpdate } from '../../../core/model/patient/patient';
import { PatientService } from '../../../core/service/patient/patient.service';
import { ExamService } from '../../../core/service/exam/exam.service';
import { CertificateService } from '../../../core/service/exports/certificate/certificate.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    selector: 'app-patient',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule,
        ToolbarModule, DialogModule, CalendarModule, TextareaModule, SelectModule,
        ToastModule, TagModule, IconFieldModule, InputIconModule, FluidModule, DatePickerModule, DropdownModule
    ],
    templateUrl: './patient.component.html',
    styleUrl: './patient.component.scss',
    providers: [MessageService]
})
export class PatientComponent implements OnInit {

    pacientes: Patient[] = [];
    paciente: Patient = {} as Patient;
    selectedPatients: Patient[] = [];

    pacienteDialog: boolean = false;
    submitted: boolean = false;
    loading: boolean = true;
    loadingCert: boolean = false;
    esEdicion: boolean = false;

    // Objeto para errores del backend
    backendErrors: any = {
        ci: '',
        correo: '',
        telefono: '',
        fecNacimiento: ''
    };

    // Opciones para el estado
    estados = [
        { label: 'Activo', value: 'A' },
        { label: 'Inactivo', value: 'I' }
    ];

    private examService = inject(ExamService);
    private certificateService = inject(CertificateService);
    private patientService = inject(PatientService);

    constructor(
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.loadPatients();
    }

    loadPatients() {
        this.loading = true;
        this.patientService.getPatients().subscribe({
            next: (data) => {
                // 2. CONVERSIÓN VITAL: String del Back -> Date de JS para el Front
                this.pacientes = data.map(p => ({
                    ...p,
                    fecNacimiento: p.fecNacimiento ? new Date(p.fecNacimiento) : '',
                    fecRegistro: p.fecRegistro ? new Date(p.fecRegistro) : '',
                })) as Patient[]; // Casteo necesario por la manipulación de tipos

                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los pacientes' });
            }
        });
    }

    openNew() {
        this.esEdicion = false;
        this.paciente = {} as Patient;
        this.paciente.estado = 'A';
        this.backendErrors = {
            ci: '', correo: '', telefono: '',
            fecNacimiento: ''
        };
        this.submitted = false;
        this.pacienteDialog = true;
    }

    hideDialog() {
        this.pacienteDialog = false;
        this.submitted = false;
    }

    editPatient(patient: Patient) {
        this.esEdicion = true;

        this.backendErrors = { ci: '', correo: '', telefono: '', fecNacimiento: '' };

        this.paciente = { ...patient };
        this.submitted = false;
        this.pacienteDialog = true;
    }

    savePatient() {
        this.submitted = true;
        this.backendErrors = {
            ci: '', correo: '', telefono: '',
            fecNacimiento: ''
        };

        // Validaciones básicas requeridas
        if (!this.paciente.nombre || !this.paciente.apellido ||
            !this.paciente.ci || !this.paciente.fecNacimiento ||
            !this.paciente.telefono || !this.paciente.correo) {
            return;
        }

        this.loading = true;

        // Preparamos el payload (formateando fecha)
        const payload: any = { ...this.paciente };
        payload.fecNacimiento = this.formatDate(this.paciente.fecNacimiento);
        // fecRegistro no se envía al crear, y al actualizar el backend la ignora, así que no importa mucho

        if (this.esEdicion) {
            // --- ACTUALIZAR ---
            // Aseguramos que el payload cumpla con la interfaz PatientUpdate (con ID)
            const updatePayload: PatientUpdate = {
                idPaciente: this.paciente.idPaciente!, // El ID debe existir en edición
                nombre: payload.nombre,
                apellido: payload.apellido,
                ci: payload.ci,
                fecNacimiento: payload.fecNacimiento,
                direccion: payload.direccion,
                telefono: payload.telefono,
                correo: payload.correo,
                estado: payload.estado
            };

            this.patientService.updatePatient(updatePayload).subscribe({
                next: () => {
                    Swal.fire('¡Actualizado!', `Paciente ${this.paciente.nombre} actualizado.`, 'success');
                    this.pacienteDialog = false;
                    this.loadPatients();
                },
                error: (err) => this.manejarErroresBackend(err),
                complete: () => this.loading = false
            });

        } else {
            // --- CREAR ---
            this.patientService.savePatient(payload).subscribe({
                next: () => {
                    Swal.fire('¡Creado!', `Paciente ${this.paciente.nombre} registrado.`, 'success');
                    this.pacienteDialog = false;
                    this.loadPatients();
                },
                error: (err) => this.manejarErroresBackend(err),
                complete: () => this.loading = false
            });
        }
    }

    validarSoloNumeros(event: any) {
        const input = event.target;
        // Reemplaza cualquier carácter que NO sea un número del 0 al 9 por un string vacío
        input.value = input.value.replace(/[^0-9]/g, '');
        // Actualiza el modelo manualmente para asegurar sincronización
        this.paciente.ci = input.value;
    }

    // Filtra números y caracteres especiales, dejando solo letras, tildes, ñ y espacios
    validarSoloLetras(event: any, campo: 'nombre' | 'apellido') {
        const input = event.target;
        input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');

        if (campo === 'nombre') {
            this.paciente.nombre = input.value;
        } else {
            this.paciente.apellido = input.value;
        }
    }

    // Reutilizamos la lógica de números para el teléfono
    validarSoloNumerosTelefono(event: any) {
        const input = event.target;
        input.value = input.value.replace(/[^0-9]/g, '');
        this.paciente.telefono = input.value;
    }

    private manejarErroresBackend(err: any) {
        this.loading = false;
        const mensaje = (err.error?.mensaje || '').toLowerCase(); // Convertimos a minúsculas una sola vez

        // 1. LIMPIEZA TOTAL: Borramos cualquier error previo para que no se "crucen"
        this.backendErrors = {
            ci: '',
            correo: '',
            telefono: '',
            fecNacimiento: ''
        };

        console.log("Error detectado:", mensaje); // Para ver en consola qué llega exactamenente

        // 2. CLASIFICACIÓN ESTRICTA

        // A. Fecha / Edad (Busca palabras clave: edad, año, nacimiento)
        if (mensaje.includes('edad') || mensaje.includes('año') || mensaje.includes('nacimiento')) {
            this.backendErrors.fecNacimiento = err.error?.mensaje;
        }

        // B. Correo (Busca: correo, email)
        else if (mensaje.includes('correo') || mensaje.includes('email')) {
            this.backendErrors.correo = err.error?.mensaje;
        }

        // C. Teléfono (Busca: teléfono, telefono)
        else if (mensaje.includes('teléfono') || mensaje.includes('telefono')) {
            this.backendErrors.telefono = err.error?.mensaje;
        }

        // D. Cédula (Busca: cédula, cedula, ci, identificación)
        else if (mensaje.includes('cédula') || mensaje.includes('cedula') || mensaje.includes('ci')) {
            this.backendErrors.ci = err.error?.mensaje;
        }

        // E. Error Genérico (Si no coincide con nada, muestra alerta flotante)
        else {
            Swal.fire('Error', err.error?.mensaje || 'Error al procesar la solicitud', 'error');
        }
    }

    // Función auxiliar para formatear fechas a yyyy-MM-dd
    formatDate(date: Date | string | undefined): string {
        if (!date) return '';
        const d = new Date(date);
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();

        return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    }

    exportExcel() {
        console.log('Exportando a Excel...');
        // Implementar lógica real si se requiere
    }

    async downloadCertificate(patient: Patient) {
        if (!patient.idPaciente) return;

        try {
            this.loadingCert = true;
            // this.messageService.add({ severity: 'info', summary: 'Generando...', detail: 'Buscando último examen...' });

            // 1. Buscamos todos los exámenes del paciente
            const examenes = await firstValueFrom(this.examService.getByPacienteId(patient.idPaciente));

            // 2. Validamos si tiene exámenes
            if (!examenes || examenes.length === 0) {
                this.messageService.add({ severity: 'warn', summary: 'Sin datos', detail: 'El paciente no tiene exámenes registrados.' });
                return;
            }

            // 3. Ordenamos por fecha (Más reciente primero) y tomamos el primero (índice 0)
            // Asumimos que la fecha viene como string ISO o similar.
            // Si el backend trae el ID incremental, también podrías ordenar por ID descendente.
            const ultimoExamen = examenes.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

            console.log("Generando certificado con examen ID:", ultimoExamen.idExamen);

            // 4. Generamos el PDF
            const nombreCompleto = `${patient.nombre} ${patient.apellido}`;
            this.certificateService.generateCertificate({
                examen: ultimoExamen,
                nombrePaciente: nombreCompleto,
                // logoBase64: '...' // Si tienes logo ponlo aquí
            });

            this.messageService.add({ severity: 'success', summary: 'Listo', detail: 'Certificado generado.' });

        } catch (error) {
            console.error('Error al generar certificado:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el certificado.' });
        } finally {
            this.loadingCert = false;
        }
    }
}
