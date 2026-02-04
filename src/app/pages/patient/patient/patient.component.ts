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
import { Patient } from '../../../core/model/patient/patient';
import { PatientService } from '../../../core/service/patient/patient.service';
import { ExamService } from '../../../core/service/exam/exam.service';
import { CertificateService } from '../../../core/service/exports/certificate/certificate.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-patient',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule,
        ToolbarModule, DialogModule, CalendarModule, TextareaModule, SelectModule,
        ToastModule, TagModule, IconFieldModule, InputIconModule, FluidModule, DatePickerModule
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

    // Opciones para el estado
    estados = [
        { label: 'Activo', value: 'A' },
        { label: 'Inactivo', value: 'I' }
    ];

    private examService = inject(ExamService);
    private certificateService = inject(CertificateService);

    constructor(
        private messageService: MessageService,
        private patientService: PatientService // 1. Inyectamos el servicio
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
        this.paciente = {} as Patient;
        // Inicializamos fechas por defecto si deseas
        this.paciente.fecRegistro = new Date();
        this.paciente.estado = 'A';
        this.submitted = false;
        this.pacienteDialog = true;
    }

    hideDialog() {
        this.pacienteDialog = false;
        this.submitted = false;
    }

    savePatient() {
        this.submitted = true;

        // Validación básica
        if (this.paciente.nombre?.trim() && this.paciente.ci?.trim()) {
            this.loading = true;

            // 3. PREPARAR PAYLOAD: Convertir Date JS -> String 'yyyy-MM-dd' para Java
            // Clonamos el objeto para no modificar el visual mientras se envía
            const payload: any = { ...this.paciente };

            payload.fecNacimiento = this.formatDate(this.paciente.fecNacimiento);
            payload.fecRegistro = this.formatDate(this.paciente.fecRegistro);

            this.patientService.savePatient(payload).subscribe({
                next: (res) => {
                    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Paciente Guardado' });
                    this.pacienteDialog = false;
                    this.paciente = {} as Patient;
                    this.loadPatients(); // Recargamos la tabla desde el servidor
                },
                error: (err) => {
                    this.loading = false;
                    console.error(err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Falló al guardar el paciente' });
                }
            });
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
