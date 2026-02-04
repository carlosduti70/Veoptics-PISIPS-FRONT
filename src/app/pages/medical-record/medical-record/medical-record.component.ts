import { Component, inject } from '@angular/core';
import { ExamenOptometricoResponse } from '../../../core/model/exam/exam';
import { firstValueFrom } from 'rxjs';
import { ExamService } from '../../../core/service/exam/exam.service';
import { Fluid } from "primeng/fluid";
import { Button } from "primeng/button";
import { AutoComplete } from "primeng/autocomplete";
import { Divider } from "primeng/divider";
import { DatePicker } from "primeng/datepicker";
import { HistoryService } from '../../../core/service/history/history.service';
import { MedicalHistory } from '../../../core/model/MedicalHistory/medical-history';

@Component({
    selector: 'app-medical-record',
    imports: [Fluid, Button, AutoComplete, Divider, DatePicker],
    templateUrl: './medical-record.component.html',
    styleUrl: './medical-record.component.scss'
})
export class MedicalRecordComponent {
    cargando = false;
    examenes: ExamenOptometricoResponse[] = [];
    historiales: MedicalHistory[] = [];

    private examService = inject(ExamService);
    private historyService = inject(HistoryService);

    ngOnInit() {
        this.cargarListaExamenes();
        this.cargarListahistorial();
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


    private async cargarListahistorial() {
        try {
            this.cargando = true;
            const respuesta = await firstValueFrom(this.historyService.getHistories());
            this.historiales = respuesta;
            console.log(this.historiales);
        } catch (error) {
            console.error(error);
        } finally {
            this.cargando = false;
        }
    }

}
