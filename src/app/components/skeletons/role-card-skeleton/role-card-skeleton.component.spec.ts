import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleCardSkeletonComponent } from './role-card-skeleton.component';
import { ROLE_LIMIT } from '../../../core/models/constants/role.constants';

describe('RoleCardSkeletonComponent', () => {
  let component: RoleCardSkeletonComponent;
  let fixture: ComponentFixture<RoleCardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleCardSkeletonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleCardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render ROLE_LIMIT skeleton cards, matching the max roles a user can have', () => {
    const cards = fixture.nativeElement.querySelectorAll('.role-skeleton-card');
    expect(cards.length).toBe(ROLE_LIMIT);
  });

  it('should render title, industry, and one document placeholder per skeleton card', () => {
    const firstCard = fixture.nativeElement.querySelector('.role-skeleton-card');

    expect(firstCard.querySelector('.skeleton-title')).toBeTruthy();
    expect(firstCard.querySelector('.skeleton-industry')).toBeTruthy();
    expect(firstCard.querySelector('.skeleton-doc-icon')).toBeTruthy();
    expect(firstCard.querySelector('.skeleton-doc-name')).toBeTruthy();
    expect(firstCard.querySelector('.skeleton-doc-meta')).toBeTruthy();
  });

  it('should have shimmer animation on skeleton elements', () => {
    const skeleton = fixture.nativeElement.querySelector('.skeleton');
    const styles = getComputedStyle(skeleton);

    expect(styles.animation).toContain('shimmer');
    expect(styles.backgroundSize).toBe('200% 100%');
  });
});
