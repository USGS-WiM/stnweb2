import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapComponent } from '@app/map/map.component';
import { SettingsComponent } from '@app/settings/settings.component';
import { ApprovalsComponent } from '@app/approvals/approvals.component';
import { BulkHwmComponent } from './bulk-hwm/bulk-hwm.component';
import { HwmUploadComponent } from './hwm-upload/hwm-upload.component';
import { SiteDetailsComponent } from './site-details/site-details.component';

const routes: Routes = [
    { path: '', redirectTo: 'map', pathMatch: 'full' },
    { path: 'map', component: MapComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'site/:id', component: SiteDetailsComponent },
    { path: 'approvals', component: ApprovalsComponent },
    { path: 'bulkhwm', component: BulkHwmComponent },
    { path: 'hwmupload', component: HwmUploadComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}

// export const AppRoutingModule = RouterModule.forRoot(routes, { useHash: true }); // implements /#/
