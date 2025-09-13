import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordStrengthCheckerComponent } from './password-strength-checker.component';
import { PasswordStrength } from '../../core/models/enums/password-strength.enum';

describe('PasswordStrengthCheckerComponent', () => {
  let component: PasswordStrengthCheckerComponent;
  let fixture: ComponentFixture<PasswordStrengthCheckerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrengthCheckerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordStrengthCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
