import { inject, Injectable } from '@angular/core';
import { Rol } from '../../model/rol/rol';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { map, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RolService {

    private rol: Rol[] = [];

    private http = inject(HttpClient);

    constructor() { }

    getRols(): Observable<Rol[]> {
        return this.http.get<Rol[]>(`${environment.apiUrl}/rol/listar`).pipe(
            map(response => {
                this.rol = response;
                return this.rol;
            })
        );
    }

    saveRols(patient: Rol): Observable<Rol> {
        return this.http.post<Rol>(`${environment.apiUrl}/rol/crear`, patient);
    }
}
