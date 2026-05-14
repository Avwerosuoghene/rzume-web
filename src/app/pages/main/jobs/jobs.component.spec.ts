import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobsComponent } from './jobs.component';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { MatIconModule } from '@angular/material/icon';

describe('JobsComponent', () => {
  let component: JobsComponent;
  let fixture: ComponentFixture<JobsComponent>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;


  beforeEach(async () => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track']);

    await TestBed.configureTestingModule({
      imports: [
        JobsComponent,
        MatIconModule
      ],
      providers: [
        { provide: AnalyticsService, useValue: analyticsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
