import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ProfileManagementComponent } from './profile-management.component';

describe('ProfileManagementComponent', () => {
  let component: ProfileManagementComponent;
  let fixture: ComponentFixture<ProfileManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileManagementComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render without errors', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('should be a standalone component', () => {
    expect(component).toBeInstanceOf(ProfileManagementComponent);
  });
});
