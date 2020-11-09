import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentUserService } from '@services/current-user.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HomeComponent],
            imports: [MatAutocompleteModule],
            providers: [CurrentUserService, HttpClient, HttpHandler],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
