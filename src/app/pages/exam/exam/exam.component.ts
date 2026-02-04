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
import { RadioButton, RadioButtonModule } from "primeng/radiobutton";
import { Checkbox, CheckboxModule } from "primeng/checkbox";
import { HistoryService } from '../../../core/service/history/history.service';

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
        AutoCompleteModule,
        RadioButton,
        Checkbox,
        RadioButtonModule,
        CheckboxModule,
        DividerModule
    ],
    providers: [MessageService],
    templateUrl: './exam.component.html'
})
export class ExamComponent implements OnInit {
    patientForm!: FormGroup;
    examForm!: FormGroup;
    historyForm!: FormGroup;

    cargando: boolean = false;
    loading: boolean = false;
    submitted: boolean = false;

    datosOptometrista: Optometrist = {} as Optometrist;
    userId = environment.userId;
    allPatients: Patient[] = [];
    filteredPatients: Patient[] = [];
    selectedPatientSearch: any | null = null;



    private optometristService = inject(OptometristService);
    private patientService = inject(PatientService);
    private examService = inject(ExamService);
    private historyService = inject(HistoryService);
    private router = inject(Router);

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.initPatientForm();
        this.initExamForm();
        this.initHistoryForm();
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

    initHistoryForm() {
        this.historyForm = this.fb.group({
            antecedente: ['', Validators.required],
            diagnostico: ['', Validators.required],
            notasClinica: ['', Validators.required],
            motivoConsulta: ['', Validators.required],
            fecha: [new Date(), Validators.required]
        })
    };

    initExamForm() {
        this.examForm = this.fb.group({
            fecha: [new Date(), Validators.required],
            // Ojo Derecho
            esferaOd: ['', Validators.required],
            cilindroOd: ['', Validators.required],
            ejeOd: ['', Validators.required],
            adicionOd: ['', Validators.required],
            agudezaVisualLejosOd: ['', Validators.required],
            agudezaVisualCercaOd: ['', Validators.required],
            dnpOd: ['', Validators.required], // Nuevo
            alturaOd: ['', Validators.required],
            // Ojo Izquierdo
            esferaOi: ['', Validators.required],
            cilindroOi: ['', Validators.required],
            ejeOi: ['', Validators.required],
            adicionOi: ['', Validators.required],
            agudezaVisualLejosOi: ['', Validators.required],
            agudezaVisualCercaOi: ['', Validators.required],
            dnpOi: ['', Validators.required], // Nuevo
            alturaOi: ['', Validators.required],

            // Diagnóstico y Evaluación
            diagnostico: ['', Validators.required],

            // Lógica interna para construir los strings finales
            visionCercanaEstado: ['', Validators.required], // Radio
            visionCercanaLentes: [false], // Checkbox

            visionLejanaEstado: ['', Validators.required], // Radio
            visionLejanaLentes: [false], // Checkbox

            percepcionColores: ['', Validators.required], // Radio (capacidad vs problemas)
            coloresVisibles: [''] // Input condicional
        });
    }
    saveExam() {
        this.submitted = true;

        // 1. Validaciones Generales
        if (!this.selectedPatientSearch || !this.selectedPatientSearch.idPaciente) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe buscar y SELECCIONAR un paciente.' });
            return;
        }

        if (!this.datosOptometrista || !this.datosOptometrista.idOptometrista) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Faltan datos del optometrista.' });
            return;
        }

        // 2. Validar ambos formularios
        if (this.examForm.invalid || this.historyForm.invalid) {
            this.messageService.add({ severity: 'warn', summary: 'Faltan Datos', detail: 'Complete todos los campos del Examen y de la Historia.' });
            return;
        }

        const f = this.examForm.value;

        // Construcción de strings compuestos (Lógica visual)
        let vcFinal = f.visionCercanaEstado;
        if (f.visionCercanaLentes) vcFinal += " - Precisa lentes";

        let vlFinal = f.visionLejanaEstado;
        if (f.visionLejanaLentes) vlFinal += " - Precisa lentes";

        let coloresVisiblesFinal = "";
        if (f.percepcionColores === 'problemas') {
            coloresVisiblesFinal = f.coloresVisibles || "No especificado";
        } else {
            coloresVisiblesFinal = "Normal";
        }

        // 3. Payload del Examen
        const examPayload: ExamenOptometricoRequest = {
            fecha: this.formatDate(f.fecha),
            esferaOd: f.esferaOd, cilindroOd: f.cilindroOd, ejeOd: f.ejeOd, adicionOd: f.adicionOd,
            agudezaVisualLejosOd: f.agudezaVisualLejosOd, agudezaVisualCercaOd: f.agudezaVisualCercaOd,
            dnpOd: f.dnpOd, alturaOd: f.alturaOd,
            esferaOi: f.esferaOi, cilindroOi: f.cilindroOi, ejeOi: f.ejeOi, adicionOi: f.adicionOi,
            agudezaVisualLejosOi: f.agudezaVisualLejosOi, agudezaVisualCercaOi: f.agudezaVisualCercaOi,
            dnpOi: f.dnpOi, alturaOi: f.alturaOi,
            diagnostico: f.diagnostico,
            visionCercana: vcFinal,
            visionLejana: vlFinal,
            percepcionColores: f.percepcionColores === 'capacidad' ? 'Normal' : 'Anomalía Cromática',
            coloresVisibles: coloresVisiblesFinal,
            idPaciente: this.selectedPatientSearch.idPaciente,
            idOptometrista: this.datosOptometrista.idOptometrista
        };

        Swal.fire({
            title: 'Guardando...',
            text: 'Registrando examen e historia clínica.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        this.loading = true;

        // --- FLUJO ENCADENADO: EXAMEN -> HISTORIA ---

        // A. Guardar Examen
        this.examService.saveExam(examPayload).subscribe({
            next: (examResponse) => {

                // El backend debe devolver el objeto guardado con su ID generado
                const idExamenGenerado = examResponse.idExamen;
                console.log("Examen guardado con ID:", idExamenGenerado);

                // B. Preparar Payload de Historia
                const histData = this.historyForm.value;
                const historyPayload = {
                    antecedente: histData.antecedente,
                    diagnostico: histData.diagnostico,
                    notasClinica: histData.notasClinica,
                    motivoConsulta: histData.motivoConsulta,
                    fecha: this.formatDate(histData.fecha),
                    idPaciente: this.selectedPatientSearch.idPaciente,
                    idOptometrista: this.datosOptometrista.idOptometrista || 0,
                    idExamen: idExamenGenerado // <--- AQUÍ USAMOS EL ID RECUPERADO
                };

                // C. Guardar Historia
                this.historyService.saveHistory(historyPayload).subscribe({
                    next: (histResponse) => {
                        this.loading = false;
                        Swal.fire({
                            icon: 'success',
                            title: '¡Proceso Completado!',
                            text: 'Se guardó el examen y la historia clínica correctamente.',
                            confirmButtonText: 'Aceptar'
                        }).then((result) => {
                            if (result.isConfirmed) this.router.navigate(['/']);
                        });
                        this.resetForm();
                    },
                    error: (errHist) => {
                        console.error(errHist);
                        this.loading = false;
                        Swal.fire({
                            icon: 'warning',
                            title: 'Atención',
                            text: 'El examen se guardó, pero hubo un error al guardar la Historia Clínica.'
                        });
                    }
                });
            },
            error: (errExam) => {
                console.error(errExam);
                this.loading = false;
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el examen.' });
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
        return d.toISOString().split('T')[0];
    }
}
