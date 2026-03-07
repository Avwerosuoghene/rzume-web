import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordStrengthCheckerComponent } from './password-strength-checker.component';
import { PasswordStrength } from '../../core/models/enums/password-strength.enum';
import { PASSWORD_CHECKER_MESSAGES } from './password-strength-checker.constants';

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

  describe('Apple-style Requirements Display', () => {
    it('should show requirements in pending state initially', () => {
      const compiled = fixture.nativeElement;
      const requirementItems = compiled.querySelectorAll('.requirement-item');
      
      expect(requirementItems.length).toBe(5);
      requirementItems.forEach((item: HTMLElement) => {
        expect(item.classList.contains('pending')).toBe(true);
      });
    });

    it('should show requirements section with subtle opacity initially', () => {
      const compiled = fixture.nativeElement;
      const requirementsSection = compiled.querySelector('.requirements-section');
      
      expect(requirementsSection).toBeTruthy();
      expect(requirementsSection.classList.contains('show-feedback')).toBe(false);
    });

    it('should display all 5 password requirements', () => {
      const compiled = fixture.nativeElement;
      const requirements = compiled.querySelectorAll('.requirement-text');
      
      expect(requirements.length).toBe(5);
      expect(requirements[0].textContent).toContain('8 characters');
      expect(requirements[1].textContent).toContain('uppercase');
      expect(requirements[2].textContent).toContain('lowercase');
      expect(requirements[3].textContent).toContain('number');
      expect(requirements[4].textContent).toContain('special character');
    });
  });

  describe('Progressive Feedback', () => {
    it('should show detailed feedback after user starts typing', () => {
      component.checkPasswordStrength('Test');
      fixture.detectChanges();
      
      expect(component['showDetailedFeedback']()).toBe(true);
      
      const compiled = fixture.nativeElement;
      const requirementsSection = compiled.querySelector('.requirements-section');
      expect(requirementsSection.classList.contains('show-feedback')).toBe(true);
    });

    it('should not show strength section initially', () => {
      const compiled = fixture.nativeElement;
      const strengthSection = compiled.querySelector('.strength-section');
      
      expect(strengthSection).toBeFalsy();
    });

    it('should show strength section after user starts typing', () => {
      component.checkPasswordStrength('Test123');
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const strengthSection = compiled.querySelector('.strength-section');
      
      expect(strengthSection).toBeTruthy();
    });
  });

  describe('Individual Requirement Validation', () => {
    it('should validate length requirement correctly', () => {
      component.checkPasswordStrength('Test123!');
      fixture.detectChanges();
      
      const requirements = component['passwordRequirements']();
      const lengthReq = requirements.find(r => r.name === 'length');
      
      expect(component.getRequirementStatus(lengthReq!)).toBe('valid');
    });

    it('should show invalid state for unmet requirements', () => {
      component.checkPasswordStrength('test');
      fixture.detectChanges();
      
      const requirements = component['passwordRequirements']();
      const uppercaseReq = requirements.find(r => r.name === 'uppercase');
      
      expect(component.getRequirementStatus(uppercaseReq!)).toBe('invalid');
    });

    it('should update requirement icons based on status', () => {
      const requirements = component['passwordRequirements']();
      const lengthReq = requirements[0];
      
      component.checkPasswordStrength('');
      expect(component.getRequirementIcon(lengthReq)).toBe('radio_button_unchecked');
      
      component.checkPasswordStrength('Test123!');
      expect(component.getRequirementIcon(lengthReq)).toBe('check_circle');
      
      component.checkPasswordStrength('Test');
      expect(component.getRequirementIcon(lengthReq)).toBe('invalid');
    });
  });

  describe('Help Messages', () => {
    it('should show initial help message', () => {
      expect(component['helpMessage']()).toBe(PASSWORD_CHECKER_MESSAGES.INITIAL);
    });

    it('should show progress message when some requirements are met', () => {
      component.checkPasswordStrength('Test123');
      
      expect(component['helpMessage']()).toContain('of 5 requirements met');
    });

    it('should show success message when all requirements are met', () => {
      component.checkPasswordStrength('Test123!aB');
      
      expect(component['helpMessage']()).toBe(PASSWORD_CHECKER_MESSAGES.SUCCESS);
    });
  });

  describe('Strength Calculation', () => {
    it('should calculate weak strength correctly', () => {
      component.checkPasswordStrength('test');
      
      const result = component['validationResult']();
      expect(result.strength).toBe(PasswordStrength.WEAK);
    });

    it('should calculate medium strength correctly', () => {
      component.checkPasswordStrength('Test123');
      
      const result = component['validationResult']();
      expect(result.strength).toBe(PasswordStrength.MEDIUM);
    });

    it('should calculate strong strength correctly', () => {
      component.checkPasswordStrength('Test123!aB');
      
      const result = component['validationResult']();
      expect(result.strength).toBe(PasswordStrength.STRONG);
    });
  });

  describe('Accessibility', () => {
    it('should provide aria labels for requirements', () => {
      const requirements = component['passwordRequirements']();
      const lengthReq = requirements[0];
      
      const ariaLabel = component.getRequirementAriaLabel(lengthReq);
      expect(ariaLabel).toContain(lengthReq.description);
      expect(ariaLabel).toContain('pending');
    });

    it('should update aria labels based on validation status', () => {
      const requirements = component['passwordRequirements']();
      const lengthReq = requirements[0];
      
      component.checkPasswordStrength('Test123!');
      
      const ariaLabel = component.getRequirementAriaLabel(lengthReq);
      expect(ariaLabel).toContain('met');
    });
  });

  describe('Design System Integration', () => {
    it('should use design system colors for valid state', () => {
      component.checkPasswordStrength('Test123!aB');
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const validItems = compiled.querySelectorAll('.requirement-item.valid');
      
      expect(validItems.length).toBe(5);
    });

    it('should apply correct strength bar classes', () => {
      component.checkPasswordStrength('Test123');
      
      expect(component.getStrengthBarClass(0)).toBe('strength-1');
      expect(component.getStrengthBarClass(1)).toBe('strength-2');
      expect(component.getStrengthBarClass(2)).toBe('strength-3');
      expect(component.getStrengthBarClass(3)).toBe('strength-4');
      expect(component.getStrengthBarClass(4)).toBe('');
    });
  });

  describe('Responsive Behavior', () => {
    it('should render requirements section on mobile', () => {
      const compiled = fixture.nativeElement;
      const requirementsSection = compiled.querySelector('.requirements-section');
      
      expect(requirementsSection).toBeTruthy();
    });
  });

  it('should check password strength and update result', () => {
    const result = component.checkPasswordStrength('TestPass123!');
    
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
    expect(result.strength).toBeDefined();
  });

  it('should handle empty password correctly', () => {
    const result = component.checkPasswordStrength('');

    expect(result.score).toBe(0);
    expect(result.strength).toBe(PasswordStrength.NONE);
  });

  it('should have strength bars computed property', () => {
    component.checkPasswordStrength('TestPass123!');
    const bars = component.strengthBars();
    
    expect(Array.isArray(bars)).toBe(true);
  });

  it('should expose PasswordStrength enum', () => {
    expect(component['PasswordStrength']).toBeDefined();
  });
});
