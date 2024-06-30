import { ChangeDetectionStrategy, Component, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { angularMaterialModules } from '../../../core/modules/material-modules';
import { CommonModule } from '@angular/common';
import { PasswordCriteria } from '../../../core/helpers/constants';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [angularMaterialModules, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {
  signupFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);

  passwordStrength: WritableSignal<number> = signal(0);
  passwordStrengthArray: Signal<Array<number>> = computed(() => Array.from({ length: this.passwordStrength() }, (_, index) => 1 + index));




  ngOnInit(): void {
    this.initializeSignupForm();
  }

  checkPasswordStrength(): void {

    const enteredPassword = this.signupFormGroup.get('password')?.value;
    let criteriaCount: number = 1;
    let isMinimumLengthMet: boolean = false;

    if (enteredPassword === '') {
      this,this.passwordStrength.set(0);
      return;
    };

    PasswordCriteria.forEach(criteria => {


      if (criteria.validator(enteredPassword)) {
        isMinimumLengthMet?? criteria.name === 'Length';
        criteriaCount++
      }
    });

    if (criteriaCount > 3 && isMinimumLengthMet === false) {
      criteriaCount = criteriaCount -1;
    }

    console.log(criteriaCount)


    this.passwordStrength.set(criteriaCount);


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
