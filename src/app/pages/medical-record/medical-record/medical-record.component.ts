import { Component, inject } from '@angular/core';
import { ExamenOptometricoResponse } from '../../../core/model/exam/exam';
import { firstValueFrom } from 'rxjs';
import { ExamService } from '../../../core/service/exam/exam.service';
import { Fluid } from "primeng/fluid";

@Component({
    selector: 'app-medical-record',
    imports: [Fluid],
    templateUrl: './medical-record.component.html',
    styleUrl: './medical-record.component.scss'
})
export class MedicalRecordComponent {
    cargando = false;
    examenes: ExamenOptometricoResponse[] = [];

    private examService = inject(ExamService);

    ngOnInit() {
        this.cargarListaExamenes();
    }

    private async cargarListaExamenes() {
        try {
            this.cargando = true;
            const respuesta = await firstValueFrom(this.examService.getExams());
            this.examenes = respuesta;
            console.log(this.examenes);
        } catch (error) {
            console.error(error);
        } finally {
            this.cargando = false;
        }
    }

}
