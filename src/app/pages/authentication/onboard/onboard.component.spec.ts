import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { OnboardComponent } from './onboard.component';
import { ProfileManagementService } from '../../../core/services';

describe('OnboardComponent', () => {
  let component: OnboardComponent;
  let fixture: ComponentFixture<OnboardComponent>;

  beforeEach(async () => {
    const profileServiceSpy = jasmine.createSpyObj('ProfileManagementService', ['update']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    profileServiceSpy.update.and.returnValue(of({ success: true, statusCode: 200, message: 'Success', data: true }));

    await TestBed.configureTestingModule({
      imports: [OnboardComponent, NoopAnimationsModule],
      providers: [
        { provide: ProfileManagementService, useValue: profileServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
