import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EventSubmissionComponent } from './event-submission/event-submission.component';
import { CreateSiteComponent } from './create-site/create-site.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  // { path: 'addEvent', component: EventSubmissionComponent }
  { path: 'addSite', component: CreateSiteComponent },
  /* { path: 'event/:id', component: EventDetailsComponent },
  { path: 'userdashboard', component: UserDashboardComponent, canActivate: [AuthenticationGuard] }, */
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
