import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GoogleSignInComponent } from './google-sign-in.component';
import { AuthenticationService } from '../../core/services';

describe('GoogleSignInComponent', () => {
  let component: GoogleSignInComponent;
  let fixture: ComponentFixture<GoogleSignInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleSignInComponent, HttpClientTestingModule],
      providers: [
        AuthenticationService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleSignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});