import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConfirmComponent } from './confirm.component';

describe('ConfirmComponent', () => {
    let component: ConfirmComponent;
    let fixture: ComponentFixture<ConfirmComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfirmComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
