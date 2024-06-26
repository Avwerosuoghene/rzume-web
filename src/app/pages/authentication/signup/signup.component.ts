import { Component, inject } from '@angular/core';
import { angularMaterialModules } from '../../../shared/shared-imports';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [angularMaterialModules, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  signupFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);


  ngOnInit(): void {
    this.initializeSignupForm();
  }


  initializeSignupForm(): void {
    this.signupFormGroup = this.fb.group({
      email: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.email
        ]
      }),
      password: this.fb.control('', {
        validators: [
          Validators.required
        ]
      })
    })
  }

}
