import { inject, Injectable } from '@angular/core';
import { UserRequest, UserResponse } from '../../model/user/user';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private users: UserResponse[] = [];

    private http = inject(HttpClient);

    constructor() { }

    getUsers(): Observable<UserResponse[]> {
        return this.http.get<UserResponse[]>(`${environment.apiUrl}/usuario/listar`).pipe(
            map(response => {
                this.users = response;
                return this.users;
            })
        )
    }

    getUserById(idUser: string): Promise<UserResponse> {
        // 1. Definimos los parámetros
        const params = new HttpParams().set('id', idUser);

        // 2. Pasamos los parámetros dentro del objeto de opciones { params }
        // 3. Especificamos el genérico en firstValueFrom para evitar el 'unknown'
        return firstValueFrom<UserResponse>(
            this.http.get<UserResponse>(`${environment.apiUrl}/usuario/findbyId`, { params })
        );
    }


    saveUser(user: UserRequest): Observable<UserRequest> {
        return this.http.post<UserRequest>(`${environment.apiUrl}/usuario/crear`, user);
    }
}
