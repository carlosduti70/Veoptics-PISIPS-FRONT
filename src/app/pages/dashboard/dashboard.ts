import { Component, inject } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { Card } from "primeng/card";

@Component({
    selector: 'app-dashboard',
    imports: [Card, RouterModule],
    templateUrl: './dashboard.html',
})
export class Dashboard {

    //inyeccion de dependencias
    private router = inject(Router);

    private route = inject(ActivatedRoute);
}
