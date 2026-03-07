import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobStatsSkeletonComponent } from './job-stats-skeleton.component';

describe('JobStatsSkeletonComponent', () => {
  let component: JobStatsSkeletonComponent;
  let fixture: ComponentFixture<JobStatsSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobStatsSkeletonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JobStatsSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render desktop skeleton layout by default', () => {
    const compiled = fixture.nativeElement;
    const statContainer = compiled.querySelector('.stat-highlight-container');
    const mobileCarousel = compiled.querySelector('.mobile-carousel');
    
    expect(statContainer).toBeTruthy();
    expect(mobileCarousel).toBeFalsy();
  });

  it('should render 4 stat elements for desktop', () => {
    const compiled = fixture.nativeElement;
    const statElements = compiled.querySelectorAll('.stat-highlight-element');
    
    expect(statElements.length).toBe(4);
  });

  it('should render mobile skeleton layout when isMobile is true', () => {
    component.isMobile = true;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const statContainer = compiled.querySelector('.stat-highlight-container');
    const mobileCarousel = compiled.querySelector('.mobile-carousel');
    
    expect(statContainer).toBeFalsy();
    expect(mobileCarousel).toBeTruthy();
  });

  it('should render 3 carousel items for mobile', () => {
    component.isMobile = true;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const carouselItems = compiled.querySelectorAll('.carousel-item');
    
    expect(carouselItems.length).toBe(3);
  });

  it('should render skeleton elements with proper classes', () => {
    const compiled = fixture.nativeElement;
    const skeletonTexts = compiled.querySelectorAll('.skeleton-text');
    const skeletonNumbers = compiled.querySelectorAll('.skeleton-number');
    
    expect(skeletonTexts.length).toBe(4);
    expect(skeletonNumbers.length).toBe(4);
  });

  it('should have shimmer animation styles', () => {
    const compiled = fixture.nativeElement;
    const skeleton = compiled.querySelector('.skeleton');
    const styles = getComputedStyle(skeleton);
    
    expect(styles.animation).toContain('shimmer');
    expect(styles.backgroundSize).toBe('200% 100%');
  });
});
