import { Component, Input, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import { PasswordCriteria, PasswordStrengthLevels } from '../../core/helpers/constants';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-password-strength-checker',
  standalone: true,
  imports: [NgClass],
  templateUrl: './password-strength-checker.component.html',
  styleUrl: './password-strength-checker.component.scss'
})
export class PasswordStrengthCheckerComponent {
  passwordStrengthValue: WritableSignal<number> = signal(0);
  passwordStrengthArray: Signal<Array<number>> = computed(() => Array.from({ length: this.passwordStrengthValue() }, (_, index) => 1 + index));
  passwordStengthDescription: string = 'nan';



  setPasswordStrengthClass(): string {

    switch (true) {
      case (this.passwordStrengthValue() == 1):
        return 'weak';
      case (this.passwordStrengthValue() > 1 && this.passwordStrengthValue() < 4):
        return 'medium';
      default:
        return 'strong'
    }
  }


  checkPasswordStrength(enteredPassword: string): void {
    let criteriaCount: number = 0;
    let isMinimumLengthMet: boolean = false;
    this.passwordStrengthValue.set(0);


    if (enteredPassword === '') {
      this.passwordStengthDescription == 'nan'
      return;
    };

    PasswordCriteria.forEach(criteria => {
      if (criteria.validator(enteredPassword)) {
        if (criteria.name.toLowerCase() === 'length') isMinimumLengthMet = true
        criteriaCount++
      }
    });

    if (!isMinimumLengthMet) {
      criteriaCount = Math.ceil((criteriaCount / 5) * 3);
    }
    this.passwordStrengthValue.set(criteriaCount);
    this.passwordStengthDescription = PasswordStrengthLevels[this.passwordStrengthValue() - 1];
  }
}
