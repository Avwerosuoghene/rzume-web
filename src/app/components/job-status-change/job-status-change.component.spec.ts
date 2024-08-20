import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobStatusChangeComponent } from './job-status-change.component';

describe('JobStatusChangeComponent', () => {
  let component: JobStatusChangeComponent;
  let fixture: ComponentFixture<JobStatusChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobStatusChangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobStatusChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
