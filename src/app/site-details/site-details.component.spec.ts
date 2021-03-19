import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { SiteDetailsComponent } from './site-details.component';

describe('SiteDetailsComponent', () => {
    let component: SiteDetailsComponent;
    let fixture: ComponentFixture<SiteDetailsComponent>;

    const fakeActivatedRoute = {
        snapshot: {
            paramMap: {
                get(): string {
                    return '123';
                },
            },
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SiteDetailsComponent],
            providers: [
                { provide: ActivatedRoute, useValue: fakeActivatedRoute },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SiteDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
