import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }
  /* { path: 'event/:id', component: EventDetailsComponent },
  { path: 'eventsubmission', component: EventSubmissionComponent, canActivate: [AuthenticationGuard] },
  { path: 'userdashboard', component: UserDashboardComponent, canActivate: [AuthenticationGuard] }, */
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
