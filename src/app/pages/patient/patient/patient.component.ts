import { Component, OnInit } from '@angular/core';
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

    // Opciones para el estado
    estados = [
        { label: 'Activo', value: 'A' },
        { label: 'Inactivo', value: 'I' }
    ];

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
}
