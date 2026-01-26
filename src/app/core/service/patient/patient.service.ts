import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, Subject, firstValueFrom } from "rxjs";
import { map } from "rxjs/operators";
import { Patient } from '../../model/patient/patient';
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
        return this.http.post<Patient>(`${environment.apiUrl}/paciente/crear`, patient);
    }
}
