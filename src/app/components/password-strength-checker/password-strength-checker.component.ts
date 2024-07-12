import { Component, Input, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import {  PasswordStrengthLevels } from '../../core/helpers/constants';
import { NgClass } from '@angular/common';
import { PasswordUtility } from '../../core/helpers/password-utility';


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
      case (this.passwordStrengthValue() >= 1 &&  this.passwordStrengthValue() <=2 ):
        return 'weak';
      case (this.passwordStrengthValue() > 2 && this.passwordStrengthValue() < 5):
        return 'medium';
      default:
        return 'strong'
    }
  }


  checkPasswordStrength(enteredPassword: string): string {
    let criteriaCount: number = 0;
    let isMinimumLengthMet: boolean = false;
    this.passwordStrengthValue.set(0);


    if (enteredPassword === '') {
      this.passwordStengthDescription = 'nan'
      return  this.passwordStengthDescription ;
    };

    PasswordUtility.passwordCriteria.forEach(criteria => {
      if (criteria.validator(enteredPassword)) {
        if (criteria.name.toLowerCase() === 'length') isMinimumLengthMet = true;

        criteriaCount++
      }
    });


    this.passwordStrengthValue.set(criteriaCount);
    this.passwordStengthDescription = PasswordStrengthLevels[this.passwordStrengthValue() - 1];

    return this.passwordStengthDescription;
  }
}
