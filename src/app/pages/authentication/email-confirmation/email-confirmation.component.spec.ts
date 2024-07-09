import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailConfirmationComponent } from './email-confirmation.component';
import { Router, provideRouter } from '@angular/router';
import { DashboardComponent } from '../../main/dashboard/dashboard.component';
import { MainComponent } from '../../main/main.component';

describe('EmailConfirmationComponent', () => {
  let component: EmailConfirmationComponent;
  let fixture: ComponentFixture<EmailConfirmationComponent>;
  let router: Router;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailConfirmationComponent],
      providers: [

        provideRouter([{ path:'dashboard', component: MainComponent }]),

      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
