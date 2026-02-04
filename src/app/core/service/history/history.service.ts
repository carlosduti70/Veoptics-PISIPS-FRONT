import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { MedicalHistory } from '../../model/MedicalHistory/medical-history';

@Injectable({
    providedIn: 'root'
})
export class HistoryService {

    private histories: MedicalHistory[] = [];

    private http = inject(HttpClient);

    constructor() { }

    getHistories(): Observable<MedicalHistory[]> {
        return this.http.get<MedicalHistory[]>(`${environment.apiUrl}/historia/listar`).pipe(
            map(response => {
                this.histories = response;
                return this.histories;
            })
        );
    }

    saveHistory(history: MedicalHistory): Observable<MedicalHistory> {
        return this.http.post<MedicalHistory>(`${environment.apiUrl}/historia/crear`, history);
    }
}
