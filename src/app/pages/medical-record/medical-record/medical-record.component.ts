import { Component, inject } from '@angular/core';
import { ExamenOptometricoResponse } from '../../../core/model/exam/exam';
import { firstValueFrom } from 'rxjs';
import { ExamService } from '../../../core/service/exam/exam.service';
import { FluidModule } from "primeng/fluid";
import { ButtonModule } from "primeng/button";
import { AutoCompleteModule } from "primeng/autocomplete";
import { DividerModule } from "primeng/divider";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Patient } from '../../../core/model/patient/patient';
import { PatientService } from '../../../core/service/patient/patient.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    selector: 'app-medical-record',
    imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FluidModule,
    ButtonModule,
    AutoCompleteModule,
    DividerModule,
    DatePickerModule,
    InputTextModule,
    ToastModule],
    providers: [MessageService],
    templateUrl: './medical-record.component.html',
    styleUrl: './medical-record.component.scss'
})
export class MedicalRecordComponent {
    patientForm!: FormGroup;
    allPatients: Patient[] = [];
    filteredPatients: Patient[] = [];
    selectedPatientSearch: any | null = null;

    // Variables para Exámenes
    cargando = false;
    examenes: ExamenOptometricoResponse[] = [];

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private patientService = inject(PatientService);
    private examService = inject(ExamService);

    ngOnInit() {
        this.initPatientForm();
        this.loadPatients();
    }

    initPatientForm() {
        this.patientForm = this.fb.group({
            ci: [''],
            nombre: [''],
            apellido: [''],
            correo: [''],
            estado: ['']
        });
    }

    loadPatients() {
        this.patientService.getPatients().subscribe({
            next: (data) => {
                this.allPatients = data.map(p => ({
                    ...p,
                    labelCompleto: `${p.apellido} ${p.nombre} - ${p.ci}`,
                }));
            }
        });
    }

    filterPatient(event: any) {
        const query = event.query.toLowerCase();
        this.filteredPatients = this.allPatients.filter(p =>
            p.nombre.toLowerCase().includes(query) ||
            p.apellido.toLowerCase().includes(query) ||
            p.ci.includes(query)
        );
    }

    // --- 2. SELECCIÓN Y CARGA DE EXÁMENES ---

    selectPatient() {
        // Validar selección
        if (!this.selectedPatientSearch) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Busque y seleccione un paciente primero.' });
            this.examenes = []; // Limpiar lista anterior si hubiera
            return;
        }

        const p = this.selectedPatientSearch;

        // Llenar formulario visual
        this.patientForm.patchValue({
            ci: p.ci,
            nombre: p.nombre,
            apellido: p.apellido,
            correo: p.correo,
            estado: p.estado ? 'Activo' : 'Inactivo'
        });

        this.messageService.add({ severity: 'info', summary: 'Paciente Cargado', detail: `Cargando historial de ${p.nombre}...` });

        // *** AQUÍ CONECTAMOS CON LA CARGA DE EXÁMENES ***
        // Usamos el ID del paciente seleccionado
        this.cargarListaExamenes(p.idPaciente);
    }

    private async cargarListaExamenes(idPaciente: number) {
        try {
            this.cargando = true;
            // Llamamos al servicio usando el ID dinámico
            const respuesta = await firstValueFrom(this.examService.getByPacienteId(idPaciente));

            // Ordenamos por fecha descendente (el más reciente primero)
            this.examenes = respuesta.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

            if (this.examenes.length === 0) {
                this.messageService.add({ severity: 'info', summary: 'Sin registros', detail: 'Este paciente no tiene exámenes registrados.' });
            }

        } catch (error) {
            console.error(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los exámenes.' });
        } finally {
            this.cargando = false;
        }
    }

}
