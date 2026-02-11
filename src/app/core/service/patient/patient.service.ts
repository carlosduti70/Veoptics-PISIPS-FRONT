import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Observable, Subject, firstValueFrom, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Patient, PatientUpdate } from '../../model/patient/patient';
import { environment } from '../../../../environment/environment';

@Injectable({
    providedIn: 'root'
})
export class PatientService {

    private patients: Patient[] = [];

    private http = inject(HttpClient);

    constructor() { }

    getPatients(): Observable<Patient[]> {
        return this.http.get<Patient[]>(`${environment.apiUrl}/paciente/listar`).pipe(
            map(response => {
                this.patients = response;
                return this.patients;
            })
        );
    }

    savePatient(patient: Patient): Observable<Patient> {
        return this.http.post<Patient>(`${environment.apiUrl}/paciente/crear`, patient).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error capturado en el servicio:', error);
                return throwError(() => error);
            })
        );
    }

    updatePatient(patient: PatientUpdate): Observable<PatientUpdate> {
        console.log('Enviando datos al backend para actualización:', patient);
        return this.http.put<PatientUpdate>(`${environment.apiUrl}/paciente/actualizar`, patient)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error('Error capturado en el servicio:', error);
                    return throwError(() => error);
                })
            );
    }
}
