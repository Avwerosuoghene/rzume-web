import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesComponent } from './roles.component';
import { ScreenManagerService } from '../../../core/services/screen-manager.service';
import { AnalyticsService } from '../../../core/services/analytics/analytics.service';
import { of, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

describe('RolesComponent', () => {
  let component: RolesComponent;
  let fixture: ComponentFixture<RolesComponent>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  beforeEach(async () => {

    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track']);

    await TestBed.configureTestingModule({
      imports: [
        RolesComponent,
        MatIconModule
      ],
      providers: [
        { provide: AnalyticsService, useValue: analyticsServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RolesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
