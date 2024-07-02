import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordStrengthCheckerComponent } from './password-strength-checker.component';
import { PasswordCriteria } from '../../core/helpers/constants';

describe('PasswordStrengthCheckerComponent', () => {
  let component: PasswordStrengthCheckerComponent;
  let fixture: ComponentFixture<PasswordStrengthCheckerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrengthCheckerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordStrengthCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set password strength value and description correctly', () => {
    const testCases = [
      { password: 'short', expectedStrength: 1, expectedDescription: 'Weak' },
      { password: 'longenough', expectedStrength: 2, expectedDescription: 'Medium' },
      { password: 'Med1umPass', expectedStrength: 2, expectedDescription: 'Strong' },
      { password: 'Str0ngPass!', expectedStrength: 4, expectedDescription: 'Strong' },
    ];


    spyOn(component.passwordStrengthValue, 'set').and.callThrough();


    testCases.forEach(testCase => {
      component.checkPasswordStrength(testCase.password);

      expect(component.passwordStrengthValue.set).toHaveBeenCalledWith(testCase.expectedStrength);
      expect(component.passwordStengthDescription).toEqual(testCase.expectedDescription);
    });; // Assuming criteriaCount sets it to 3rd level
  });

  it('should handle empty password correctly', () => {
    spyOn(component.passwordStrengthValue, 'set').and.callThrough();

    component.checkPasswordStrength('');

    expect(component.passwordStengthDescription).toEqual('nan');
    expect(component.passwordStrengthValue.set).toHaveBeenCalledWith(0);
  });
});
