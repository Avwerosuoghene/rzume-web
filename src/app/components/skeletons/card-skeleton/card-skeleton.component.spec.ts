import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardSkeletonComponent } from './card-skeleton.component';

describe('CardSkeletonComponent', () => {
  let component: CardSkeletonComponent;
  let fixture: ComponentFixture<CardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSkeletonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render card skeleton structure', () => {
    const compiled = fixture.nativeElement;
    const container = compiled.querySelector('.job-card-list-container');
    const tabsContainer = compiled.querySelector('.tabs-container');
    const cardListContainer = compiled.querySelector('.card-list-container');
    
    expect(container).toBeTruthy();
    expect(tabsContainer).toBeTruthy();
    expect(cardListContainer).toBeTruthy();
  });

  it('should render 3 tab skeletons', () => {
    const compiled = fixture.nativeElement;
    const tabSkeletons = compiled.querySelectorAll('.skeleton-tab');
    
    expect(tabSkeletons.length).toBe(3);
  });

  it('should render 4 card skeletons', () => {
    const compiled = fixture.nativeElement;
    const cardSkeletons = compiled.querySelectorAll('.skeleton-card');
    
    expect(cardSkeletons.length).toBe(4);
  });

  it('should render card structure properly', () => {
    const compiled = fixture.nativeElement;
    const firstCard = compiled.querySelector('.skeleton-card');
    const header = firstCard.querySelector('.card-header');
    const footer = firstCard.querySelector('.card-footer');
    const companyInfo = firstCard.querySelector('.company-info');
    const actionIcons = firstCard.querySelector('.action-icons');
    
    expect(header).toBeTruthy();
    expect(footer).toBeTruthy();
    expect(companyInfo).toBeTruthy();
    expect(actionIcons).toBeTruthy();
  });

  it('should render correct skeleton elements in card', () => {
    const compiled = fixture.nativeElement;
    const firstCard = compiled.querySelector('.skeleton-card');
    const companyName = firstCard.querySelector('.skeleton-company-name');
    const jobRole = firstCard.querySelector('.skeleton-job-role');
    const menuBtn = firstCard.querySelector('.skeleton-menu-btn');
    const url = firstCard.querySelector('.skeleton-url');
    const copyBtn = firstCard.querySelector('.skeleton-copy-btn');
    const date = firstCard.querySelector('.skeleton-date');
    
    expect(companyName).toBeTruthy();
    expect(jobRole).toBeTruthy();
    expect(menuBtn).toBeTruthy();
    expect(url).toBeTruthy();
    expect(copyBtn).toBeTruthy();
    expect(date).toBeTruthy();
  });

  it('should render add job button skeleton', () => {
    const compiled = fixture.nativeElement;
    const addBtnContainer = compiled.querySelector('.add-job-btn-skeleton');
    const addBtn = compiled.querySelector('.skeleton-btn');
    
    expect(addBtnContainer).toBeTruthy();
    expect(addBtn).toBeTruthy();
  });

  it('should have shimmer animation on skeleton elements', () => {
    const compiled = fixture.nativeElement;
    const skeleton = compiled.querySelector('.skeleton');
    const styles = getComputedStyle(skeleton);
    
    expect(styles.animation).toContain('shimmer');
    expect(styles.backgroundSize).toBe('200% 100%');
  });

  it('should have proper border-radius for different elements', () => {
    const compiled = fixture.nativeElement;
    const menuBtn = compiled.querySelector('.skeleton-menu-btn');
    const statusBtn = compiled.querySelector('.skeleton-status');
    const regularSkeleton = compiled.querySelector('.skeleton-tab');
    
    const menuStyles = getComputedStyle(menuBtn);
    const regularStyles = getComputedStyle(regularSkeleton);
    
    expect(menuStyles.borderRadius).toBe('50%');
    expect(regularStyles.borderRadius).toBe('16px');
  });
});
