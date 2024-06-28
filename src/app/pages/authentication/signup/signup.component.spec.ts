import { ComponentFixture, TestBed } from '@angular/core/testing';
import {MatDialog,MatDialogModule} from '@angular/material/dialog';


import { SignupComponent } from './signup.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let dialog: MatDialog;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent, InfoDialogComponent,  ReactiveFormsModule, MatDialogModule ],
      providers: [
        { provide: MatDialog, useClass: MockMatDialog }
      ]
    })
    .compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a valid form when inputs are valid', () => {
    component.signupFormGroup.controls['email'].setValue('testuser@example.com');
    component.signupFormGroup.controls['password'].setValue('Str0ngP@ssword!');
    expect(component.signupFormGroup.valid).toBeTrue();
  });

  it('should have an invalid form when inputs are invalid', () => {
    component.signupFormGroup.controls['email'].setValue('');
    component.signupFormGroup.controls['password'].setValue('');
    expect(component.signupFormGroup.invalid).toBeTrue();
  });

  it('should display a message when signup is successful', () => {
    // spyOn(signupService, 'signup').and.returnValue(of({}));
    spyOn(dialog, 'open').and.callThrough();

    component.signupFormGroup.controls['email'].setValue('testuser@example.com');
    component.signupFormGroup.controls['password'].setValue('Str0ngP@ssword!');
    component.onSubmit();

    expect(dialog.open).toHaveBeenCalledWith(InfoDialogComponent, {
      data: { message: 'Please check your email for a validation link' }
    });
  });

  it('should display an error message when signup fails', () => {
    // spyOn(signupService, 'signup').and.returnValue(throwError('Signup failed'));
    spyOn(dialog, 'open').and.callThrough();

    component.signupFormGroup.controls['email'].setValue('testuser@example.com');
    component.signupFormGroup.controls['password'].setValue('Str0ngP@ssword!');
    component.onSubmit();

    expect(dialog.open).toHaveBeenCalledWith(InfoDialogComponent, {
      data: { message: 'Signup failed. Please try again.' }
    });

  });
});
