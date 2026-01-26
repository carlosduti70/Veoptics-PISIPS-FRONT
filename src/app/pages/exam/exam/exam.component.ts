import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

// PrimeNG Imports
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { FluidModule } from 'primeng/fluid';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete'; // Importante

// Models & Services
import { Patient } from '../../../core/model/patient/patient';
import { OptometricExam } from '../../../core/model/optometric-exam/optometric-exam';
import { PatientService } from '../../../core/service/patient/patient.service';

@Component({
    selector: 'app-exam',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DatePickerModule,
        ToastModule,
        FluidModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
        DividerModule,
        AutoCompleteModule // Agregado
    ],
    providers: [MessageService],
    templateUrl: './exam.component.html'
})
export class ExamComponent implements OnInit {
    patientForm!: FormGroup;
    examForm!: FormGroup;

    // Variables para la búsqueda
    allPatients: Patient[] = [];     // La lista completa del backend
    filteredPatients: Patient[] = []; // Resultados del filtro
    selectedPatientSearch: Patient | null = null; // El objeto seleccionado en el buscador

    submitted: boolean = false;
    loading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private patientService: PatientService // Inyectamos el servicio
    ) { }

    ngOnInit(): void {
        this.initPatientForm();
        this.initExamForm();
        this.loadPatients(); // Cargamos la lista al iniciar
    }

    // Carga inicial de todos los pacientes desde el Backend
    loadPatients() {
        this.patientService.getPatients().subscribe({
            next: (data) => {
                this.allPatients = data.map(p => ({
                    ...p,
                    // Creamos una propiedad nueva para el buscador
                    labelCompleto: `${p.apellido} ${p.nombre} - ${p.ci}`,
                    fecNacimiento: p.fecNacimiento ? new Date(p.fecNacimiento) : '',
                    fecRegistro: p.fecRegistro ? new Date(p.fecRegistro) : '',
                    fecPrimero: p.fecPrimero ? new Date(p.fecPrimero) : ''
                })) as any[]; // Usamos any o extendemos la interfaz localmente
            }
        });
    }

    // Lógica de filtrado para el AutoComplete
    filterPatient(event: any) {
        const query = event.query.toLowerCase();

        this.filteredPatients = this.allPatients.filter(p =>
            p.nombre.toLowerCase().includes(query) ||
            p.apellido.toLowerCase().includes(query) ||
            p.ci.includes(query)
        );
    }

    // Acción del botón "Seleccionar"
    selectPatient() {
        if (!this.selectedPatientSearch) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Busque y seleccione un paciente primero.' });
            return;
        }

        const p = this.selectedPatientSearch;

        // Llenamos el formulario de solo lectura
        this.patientForm.patchValue({
            ci: p.ci,
            nombre: p.nombre,
            apellido: p.apellido,
            correo: p.correo,
            telefono: p.telefono,
            estado: p.estado === 'A' ? 'Activo' : 'Inactivo',
            motivoConsulta: p.motivoConsulta
            // edad: this.calculateAge(p.fecNacimiento) // Si decides usar el campo edad calculado
        });

        this.messageService.add({ severity: 'info', summary: 'Paciente Cargado', detail: `Se seleccionó a ${p.nombre} ${p.apellido}` });
    }

    initPatientForm() {
        this.patientForm = this.fb.group({
            ci: [''],
            nombre: [''],
            apellido: [''],
            correo: [''],
            telefono: [''],
            estado: [''],
            motivoConsulta: ['']
        });
    }

    initExamForm() {
        this.examForm = this.fb.group({
            fecha: [new Date(), Validators.required],
            esfera_od: ['', Validators.required],
            cilindro_od: ['', Validators.required],
            eje_od: ['', Validators.required],
            esfera_oi: ['', Validators.required],
            cilindro_oi: ['', Validators.required],
            eje_oi: ['', Validators.required],
            adicion_od: ['', Validators.required],
            adicion_oi: ['', Validators.required],
            agudeza_visual_cerca_oi: ['', Validators.required],
            agudeza_visual_lejos_oi: ['', Validators.required],
            agudeza_visual_lejos_od: ['', Validators.required],
            agudeza_visual_cerca_od: ['', Validators.required],
            altura_oi: ['', Validators.required],
            altura_od: ['', Validators.required]
        });
    }

    saveExam() {
        this.submitted = true;

        if (this.examForm.invalid) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Complete los datos clínicos requeridos.' });
            return;
        }

        if (!this.selectedPatientSearch || !this.selectedPatientSearch.idPaciente) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No hay un paciente seleccionado para este examen.' });
            return;
        }

        this.loading = true;

        // Construimos el objeto final uniendo el ID del paciente + Datos del Examen
        const payload = {
            idPaciente: this.selectedPatientSearch.idPaciente,
            ...this.examForm.value,
            // Aseguramos el formato de fecha del examen para Java
            fecha: this.formatDate(this.examForm.value.fecha)
        };

        console.log('Enviando Examen:', payload);

        setTimeout(() => {
            this.loading = false;
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Examen guardado correctamente' });
            // Opcional: Limpiar formulario
        }, 1500);
    }

    formatDate(date: Date | string): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0]; // yyyy-MM-dd
    }
}
