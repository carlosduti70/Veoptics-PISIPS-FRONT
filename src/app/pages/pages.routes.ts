import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { ProfileComponent } from './profile/profile/profile.component';
import { PatientComponent } from './patient/patient/patient.component';
import { MedicalRecordComponent } from './medical-record/medical-record/medical-record.component';
import { ExamComponent } from './exam/exam/exam.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'perfil', component: ProfileComponent },
    { path: 'pacientes', component: PatientComponent },
    { path: 'historiaclinica', component: MedicalRecordComponent },
    { path: 'examen', component: ExamComponent },

    { path: '**', redirectTo: '/notfound' },
] as Routes;
