import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import Swal from 'sweetalert2';

// PrimeNG Imports
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { FluidModule } from 'primeng/fluid';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { AutoCompleteModule } from 'primeng/autocomplete';

// Models & Services
import { Patient } from '../../../core/model/patient/patient';
import { PatientService } from '../../../core/service/patient/patient.service';
import { ExamService } from '../../../core/service/exam/exam.service';
import { ExamenOptometricoRequest } from '../../../core/model/exam/exam';
import { Optometrist } from '../../../core/model/optometrist/optometrist';
import { OptometristService } from '../../../core/service/optometrist/optometrist.service';
import { environment } from '../../../../environment/environment';
import { Router } from '@angular/router';

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
        AutoCompleteModule
    ],
    providers: [MessageService],
    templateUrl: './exam.component.html'
})
export class ExamComponent implements OnInit {
    patientForm!: FormGroup;
    examForm!: FormGroup;
    cargando: boolean = false;
    datosOptometrista: Optometrist = {} as Optometrist;

    userId = environment.userId;

    allPatients: Patient[] = [];
    filteredPatients: Patient[] = [];
    selectedPatientSearch: any | null = null; // Cambiado a any para manejar propiedades extendidas

    submitted: boolean = false;
    loading: boolean = false;

    private optometristService = inject(OptometristService);
    private router = inject(Router);

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private patientService: PatientService,
        private examService: ExamService
    ) { }

    ngOnInit(): void {
        this.initPatientForm();
        this.initExamForm();
        this.loadPatients();
        this.cargarOptometrista(this.userId);
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

    selectPatient() {
        if (!this.selectedPatientSearch) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Busque y seleccione un paciente primero.' });
            return;
        }

        const p = this.selectedPatientSearch;
        this.patientForm.patchValue({
            ci: p.ci,
            nombre: p.nombre,
            apellido: p.apellido,
            correo: p.correo,
            estado: p.estado ? 'Activo' : 'Inactivo' // Ajuste según tu booleano/string
        });

        this.messageService.add({ severity: 'info', summary: 'Paciente Cargado', detail: `Se seleccionó a ${p.nombre} ${p.apellido}` });
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

    async cargarOptometrista(idUsuario: number) {
        try {
            this.cargando = true;
            this.datosOptometrista = await this.optometristService.getByUserId(idUsuario);
            console.log('optometrista cargado:', this.datosOptometrista);
        } catch (error) {
            console.error('Error al optometrista:', error);
        } finally {
            this.cargando = false;
        }
    }

    initExamForm() {
        this.examForm = this.fb.group({
            fecha: [new Date(), Validators.required],
            esferaOd: ['', Validators.required],
            cilindroOd: ['', Validators.required],
            ejeOd: ['', Validators.required],
            esferaOi: ['', Validators.required],
            cilindroOi: ['', Validators.required],
            ejeOi: ['', Validators.required],
            adicionOd: ['', Validators.required],
            adicionOi: ['', Validators.required],
            agudezaVisualCercaOi: ['', Validators.required],
            agudezaVisualLejosOi: ['', Validators.required],
            agudezaVisualLejosOd: ['', Validators.required],
            agudezaVisualCercaOd: ['', Validators.required],
            alturaOi: ['', Validators.required],
            alturaOd: ['', Validators.required]
        });
    }

    saveExam() {
        this.submitted = true;

        // --- VALIDACIÓN 1: Paciente seleccionado ---
        if (!this.selectedPatientSearch || !this.selectedPatientSearch.idPaciente) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe buscar y SELECCIONAR un paciente antes de guardar.' });
            return;
        }

        // --- VALIDACIÓN 2: Datos del Optometrista (Lo que pediste) ---
        if (!this.datosOptometrista || !this.datosOptometrista.idOptometrista) {
            Swal.fire({
                icon: 'warning',
                title: 'Información incompleta',
                text: 'Falta información del optometrista, vaya a "Perfil" y actualizar.',
                confirmButtonText: 'Ir a Perfil',
                showCancelButton: true,
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Redirige al perfil si el usuario hace clic en aceptar
                    this.router.navigate(['/pages/perfil']);
                }
            });
            return; // Detenemos el proceso aquí
        }

        // --- VALIDACIÓN 3: Formulario válido ---
        if (this.examForm.invalid) {
            this.messageService.add({ severity: 'warn', summary: 'Faltan Datos', detail: 'Complete todos los campos del examen clínico.' });
            return;
        }

        // Preparar datos
        const formValues = this.examForm.value;
        const payload: ExamenOptometricoRequest = {
            ...formValues,
            fecha: this.formatDate(formValues.fecha),
            idPaciente: this.selectedPatientSearch.idPaciente,
            idOptometrista: this.datosOptometrista.idOptometrista
        };

        // --- ALERTA DE CARGA (Procesando...) ---
        Swal.fire({
            title: 'Procesando...',
            text: 'Generando registro médico.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Enviar al Backend
        this.examService.saveExam(payload).subscribe({
            next: (res) => {
                // Cerramos la alerta de carga y mostramos la de éxito
                Swal.fire({
                    icon: 'success',
                    title: '¡Examen Guardado!',
                    text: 'El examen clínico se ha registrado correctamente.',
                    confirmButtonText: 'Finalizar',
                    allowOutsideClick: false
                }).then((result) => {
                    // --- REDIRECCIÓN AL DASHBOARD ---
                    if (result.isConfirmed) {
                        this.router.navigate(['/']);
                    }
                });

                this.resetForm();
            },
            error: (err) => {
                console.error(err);
                // Alerta de Error
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo guardar el examen. Intente nuevamente.',
                });
            }
        });
    }

    resetForm() {
        this.submitted = false;
        this.examForm.reset();
        this.examForm.patchValue({ fecha: new Date() });
    }

    formatDate(date: Date | string): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0]; // yyyy-MM-dd
    }
}
