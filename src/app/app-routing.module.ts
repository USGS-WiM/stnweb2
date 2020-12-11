import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapComponent } from './map/map.component';

const routes: Routes = [
    { path: '', redirectTo: 'map', pathMatch: 'full' },
    { path: 'map', component: MapComponent },
    /* { path: 'event/:id', component: EventDetailsComponent },
  { path: 'userdashboard', component: UserDashboardComponent, canActivate: [AuthenticationGuard] }, */
];

/* @NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
}) */
/* export class AppRoutingModule { } */

export const AppRoutingModule = RouterModule.forRoot(routes, { useHash: true }); // implements /#/
