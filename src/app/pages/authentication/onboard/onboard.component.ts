import { Component, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AngularMaterialModules } from '../../../core/modules/material-modules';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { CircularLoaderComponent } from '../../../components/circular-loader/circular-loader.component';
import { CoreModules } from '../../../core/modules/core-modules';

@Component({
  selector: 'app-onboard',
  standalone: true,
  imports: [AngularMaterialModules, CoreModules, CircularLoaderComponent],
  templateUrl: './onboard.component.html',
  styleUrl: './onboard.component.scss'
})
export class OnboardComponent {
  onboardFormGroup!: FormGroup;
  fb = inject(NonNullableFormBuilder);
  loaderIsActive: boolean = false;
  router = inject(Router);


  constructor(private authService: AuthenticationService) {

  }

  ngOnInit(): void {
    this.initializeOnBoardForm();
  }

  initializeOnBoardForm(): void {
    this.onboardFormGroup = this.fb.group({
      username: this.fb.control('', {
        validators: [Validators.required]
      })
    })
  }

  isBtnDisabled(): boolean {
    return (this.onboardFormGroup.invalid ||
      this.loaderIsActive);
  }

  submitOnboardForm() {

  }

}
