import { inject, Injectable } from '@angular/core';
import { Optometrist } from '../../model/optometrist/optometrist';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { firstValueFrom, map, Observable } from 'rxjs';

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
        // 1. Definimos los parámetros
        const params = new HttpParams().set('id', idUser);

        return firstValueFrom<Optometrist>(
            this.http.get<Optometrist>(`${environment.apiUrl}/optometrista/buscarUsuario`, { params })
        );
    }

    saveOptometrist(optometrist: Optometrist): Observable<Optometrist> {
        return this.http.post<Optometrist>(`${environment.apiUrl}/optometrista/crear`, optometrist);
    }
}
