import { inject, Injectable } from '@angular/core';
import { Optometrist, OptometristUpdate } from '../../model/optometrist/optometrist';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { catchError, firstValueFrom, map, Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OptometristService {

    private patients: Optometrist[] = [];

    private http = inject(HttpClient);

    constructor() { }

    getOptometrists(): Observable<Optometrist[]> {
        return this.http.get<Optometrist[]>(`${environment.apiUrl}/optometrista/listar`).pipe(
            map(response => {
                this.patients = response;
                return this.patients;
            })
        );
    }

    getByUserId(idUser: number): Promise<Optometrist> {
        const params = new HttpParams().set('id', idUser);

        return firstValueFrom<Optometrist>(
            this.http.get<Optometrist>(`${environment.apiUrl}/optometrista/buscarUsuario`, { params })
        );
    }

    saveOptometrist(optometrist: Optometrist): Observable<Optometrist> {
        return this.http.post<Optometrist>(`${environment.apiUrl}/optometrista/crear`, optometrist).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error capturado en el servicio:', error);
                return throwError(() => error);
            })
        );
    }

    updateUser(optometrist: OptometristUpdate): Observable<OptometristUpdate> {
        return this.http.put<OptometristUpdate>(`${environment.apiUrl}/optometrista/actualizar`, optometrist)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error('Error capturado en el servicio:', error);
                    return throwError(() => error);
                })
            );
    }
}
