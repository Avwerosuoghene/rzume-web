import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { PasswordVisibility } from "../models/types/ui-types";

export class PasswordUtility {
  static passwordVisibilityTimer: any;

  public static passwordCriteria: Array<{ name: string, validator: (password: string) => boolean }> = [
    { name: 'Length', validator: (password: string) => password.length >= 8 },
    { name: 'Uppercase', validator: (password: string) => /[A-Z]/.test(password) },
    { name: 'Lowercase', validator: (password: string) => /[a-z]/.test(password) },
    { name: 'Number', validator: (password: string) => /[0-9]/.test(password) },
    { name: 'Special Character', validator: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];


  static toggleVisibility(passwordVisibility: PasswordVisibility): PasswordVisibility {
    if (passwordVisibility === 'password') {
      clearTimeout(this.passwordVisibilityTimer);


      return 'text';
    } else {

      return 'password';
    }
  }

  static passwordMatchValidator(matchTo: string, reverse?: boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.parent && reverse) {
        const c = (control.parent?.controls as any)[matchTo];
        if (c) {
          c.updateValueAndValidity();
        }
        return null
      }
      return !!control.parent
       && !!control.parent.value
       && control.value === (control.parent?.controls as any)[matchTo].value ? null
       : { matching: true }
    }
  }
}
