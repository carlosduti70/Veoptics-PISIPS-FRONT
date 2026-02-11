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
import { Router } from '@angular/router';
import { RadioButton, RadioButtonModule } from "primeng/radiobutton";
import { Checkbox, CheckboxModule } from "primeng/checkbox";
import { HistoryService } from '../../../core/service/history/history.service';
import { AuthService } from '../../../core/service/auth/auth.service';

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
    allPatients: Patient[] = [];
    filteredPatients: Patient[] = [];
    selectedPatientSearch: any | null = null;

    private optometristService = inject(OptometristService);
    private patientService = inject(PatientService);
    private examService = inject(ExamService);
    private historyService = inject(HistoryService);
    private router = inject(Router);
    private authService = inject(AuthService);

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.initPatientForm();
        this.initExamForm();
        this.initHistoryForm();
        this.loadPatients();
        this.authService.currentUser.subscribe(user => {
            if (user && user.idUsuario) {
                this.cargarOptometrista(user.idUsuario);
            } else {
                console.warn('No hay usuario logueado');
            }
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
            estado: p.estado ? 'Activo' : 'Inactivo'
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
            // Fecha requerida pero se controla que no se edite en el HTML
            fecha: [{ value: new Date(), disabled: true }, Validators.required],
            esferaOd: ['', [Validators.required]],
            esferaOi: ['', [Validators.required]],
            // --- RESULTADOS REFRACTIVOS (SIN Validators.required) ---
            // Ojo Derecho
            cilindroOd: [''],
            ejeOd: [''],
            adicionOd: [''],
            agudezaVisualLejosOd: [''],
            agudezaVisualCercaOd: [''],
            dnpOd: [''],
            alturaOd: [''],
            // Ojo Izquierdo
            cilindroOi: [''],
            ejeOi: [''],
            adicionOi: [''],
            agudezaVisualLejosOi: [''],
            agudezaVisualCercaOi: [''],
            dnpOi: [''],
            alturaOi: [''],

            // --- ESTOS SÍ SON OBLIGATORIOS ---
            diagnostico: ['', Validators.required],
            visionCercanaEstado: ['', Validators.required],
            visionCercanaLentes: [false],
            visionLejanaEstado: ['', Validators.required],
            visionLejanaLentes: [false],
            percepcionColores: ['', Validators.required],
            coloresVisibles: ['']
        });
    }

    saveExam() {
        this.submitted = true;

        if (!this.selectedPatientSearch || !this.selectedPatientSearch.idPaciente) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe buscar y SELECCIONAR un paciente.' });
            return;
        }

        if (!this.datosOptometrista || !this.datosOptometrista.idOptometrista) {
            Swal.fire('¡Alerta!', `Faltan datos del optometrista. Ir a perfil y actualizar`, 'warning');
            return;
        }

        if (this.examForm.invalid || this.historyForm.invalid) {
            this.messageService.add({ severity: 'warn', summary: 'Faltan Datos', detail: 'Complete los campos obligatorios marcados en rojo.' });
            return;
        }

        // IMPORTANTE: Usamos getRawValue() para obtener la fecha aunque esté disabled
        const f = this.examForm.getRawValue();

        // Función auxiliar para convertir null/undefined a string vacío
        const safeStr = (val: any) => (val === null || val === undefined) ? '' : val;

        let vcFinal = safeStr(f.visionCercanaEstado);
        if (f.visionCercanaLentes) vcFinal += " - Precisa lentes";

        let vlFinal = safeStr(f.visionLejanaEstado);
        if (f.visionLejanaLentes) vlFinal += " - Precisa lentes";

        let coloresVisiblesFinal = "";
        if (f.percepcionColores === 'problemas') {
            coloresVisiblesFinal = safeStr(f.coloresVisibles) || "No especificado";
        } else {
            coloresVisiblesFinal = "Normal";
        }

        const examPayload: ExamenOptometricoRequest = {
            fecha: this.formatDate(f.fecha), // f.fecha viene gracias a getRawValue()

            // Usamos safeStr para asegurar que no se envíe null
            esferaOd: safeStr(f.esferaOd), cilindroOd: safeStr(f.cilindroOd), ejeOd: safeStr(f.ejeOd), adicionOd: safeStr(f.adicionOd),
            agudezaVisualLejosOd: safeStr(f.agudezaVisualLejosOd), agudezaVisualCercaOd: safeStr(f.agudezaVisualCercaOd),
            dnpOd: safeStr(f.dnpOd), alturaOd: safeStr(f.alturaOd),

            esferaOi: safeStr(f.esferaOi), cilindroOi: safeStr(f.cilindroOi), ejeOi: safeStr(f.ejeOi), adicionOi: safeStr(f.adicionOi),
            agudezaVisualLejosOi: safeStr(f.agudezaVisualLejosOi), agudezaVisualCercaOi: safeStr(f.agudezaVisualCercaOi),
            dnpOi: safeStr(f.dnpOi), alturaOi: safeStr(f.alturaOi),

            diagnostico: safeStr(f.diagnostico),
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

        this.examService.saveExam(examPayload).subscribe({
            next: (examResponse) => {
                const idExamenGenerado = examResponse.idExamen;

                const histData = this.historyForm.value;
                const historyPayload = {
                    antecedente: histData.antecedente,
                    diagnostico: histData.diagnostico,
                    notasClinica: histData.notasClinica,
                    motivoConsulta: histData.motivoConsulta,
                    fecha: this.formatDate(histData.fecha),
                    idPaciente: this.selectedPatientSearch.idPaciente,
                    idOptometrista: this.datosOptometrista.idOptometrista || 0,
                    idExamen: idExamenGenerado
                };

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
        // Al resetear, volvemos a poner la fecha y la deshabilitamos
        this.examForm.get('fecha')?.setValue(new Date());
        this.examForm.get('fecha')?.disable();
    }

    formatDate(date: Date | string): string {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
}
