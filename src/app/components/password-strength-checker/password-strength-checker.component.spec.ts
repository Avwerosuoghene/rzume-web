import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordStrengthCheckerComponent } from './password-strength-checker.component';
import { PasswordStrength } from '../../core/models/enums/password-strength.enum';

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

    it('should render the requirements section', () => {
      const compiled = fixture.nativeElement;
      const requirementsSection = compiled.querySelector('.requirements-section');

      expect(requirementsSection).toBeTruthy();
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

    it('should reset requirements back to pending when the password is cleared to empty', () => {
      component.checkPasswordStrength('Test123!');
      fixture.detectChanges();

      component.checkPasswordStrength('');
      fixture.detectChanges();

      const requirements = component['passwordRequirements']();
      requirements.forEach(requirement => {
        expect(component.getRequirementStatus(requirement)).toBe('pending');
      });
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

  it('should expose PasswordStrength enum', () => {
    expect(component['PasswordStrength']).toBeDefined();
  });
});
