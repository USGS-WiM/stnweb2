import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionEventComponent } from './session-event.component';

describe('SessionEventComponent', () => {
  let component: SessionEventComponent;
  let fixture: ComponentFixture<SessionEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessionEventComponent ],
      imports: [HttpClientTestingModule],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
