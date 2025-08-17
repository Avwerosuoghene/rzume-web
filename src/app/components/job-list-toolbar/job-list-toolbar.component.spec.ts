import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobListToolbarComponent } from './job-list-toolbar.component';

describe('JobListToolbarComponent', () => {
  let component: JobListToolbarComponent;
  let fixture: ComponentFixture<JobListToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobListToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobListToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
