import { inject, Injectable } from '@angular/core';
import { UserRequest, UserResponse, UserUpdate } from '../../model/user/user';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, throwError } from 'rxjs';
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
        const params = new HttpParams().set('id', idUser);

        return firstValueFrom<UserResponse>(
            this.http.get<UserResponse>(`${environment.apiUrl}/usuario/findbyId`, { params })
        );
    }


    saveUser(user: UserRequest): Observable<UserRequest> {
        return this.http.post<UserRequest>(`${environment.apiUrl}/usuario/crear`, user)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error('Error capturado en el servicio:', error);
                    return throwError(() => error);
                })
            );
    }

    updateUser(user: UserUpdate): Observable<UserUpdate> {
        console.log('Enviando datos al backend para actualización:', user);
        return this.http.put<UserUpdate>(`${environment.apiUrl}/usuario/actualizar`, user)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error('Error capturado en el servicio:', error);
                    return throwError(() => error);
                })
            );
    }
}
