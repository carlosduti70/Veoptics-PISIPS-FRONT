import { HttpClient, HttpParams } from '@angular/common/http';
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

    getByPacienteId(pacienteId: number): Observable<ExamenOptometricoResponse[]> {
        const params = new HttpParams().set('id', pacienteId);
        return this.http.get<ExamenOptometricoResponse[]>(`${environment.apiUrl}/examenoptometrico/listarPaciente`, { params }).pipe(
            map(response => response)
        );
    }

    saveExam(exam: ExamenOptometricoRequest): Observable<ExamenOptometricoResponse> {
        return this.http.post<ExamenOptometricoResponse>(`${environment.apiUrl}/examenoptometrico/crear`, exam);
    }

    constructor() { }
}
