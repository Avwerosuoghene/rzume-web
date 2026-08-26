import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailConfirmationComponent } from './email-confirmation.component';
import { provideRouter } from '@angular/router';
import { MainComponent } from '../../main/main.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('EmailConfirmationComponent', () => {
  let component: EmailConfirmationComponent;
  let fixture: ComponentFixture<EmailConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EmailConfirmationComponent,
        HttpClientTestingModule  
      ],
      providers: [
        provideRouter([{ path: 'dashboard', component: MainComponent }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});