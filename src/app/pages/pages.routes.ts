import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { ProfileComponent } from './profile/profile/profile.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'perfil', component: ProfileComponent },
    { path: '**', redirectTo: '/notfound' },
] as Routes;
