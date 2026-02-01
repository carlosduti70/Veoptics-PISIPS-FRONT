import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ExamenOptometricoRequest, ExamenOptometricoResponse } from '../../model/exam/exam';
import { environment } from '../../../../environment/environment';
import { map, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ExamService {

    private exams: ExamenOptometricoResponse[] = [];
    private http = inject(HttpClient);

    getExams(): Observable<ExamenOptometricoResponse[]> {
        return this.http.get<ExamenOptometricoResponse[]>(`${environment.apiUrl}/examenoptometrico/listar`).pipe(
            map(response => {
                this.exams = response;
                return this.exams;
            })
        )
    }

    saveExam(exam: ExamenOptometricoRequest): Observable<ExamenOptometricoRequest> {
        return this.http.post<ExamenOptometricoRequest>(`${environment.apiUrl}/examenoptometrico/crear`, exam);
    }

    constructor() { }
}
