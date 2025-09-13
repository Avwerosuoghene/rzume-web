import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CarouselComponent } from './carousel.component';
import { CarouselNavigationMode, CarouselItem } from '../../core/models/interface/carousel.models';
import { BorderRadius } from '../../core/models';

describe('CarouselComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;

  const mockItems: CarouselItem[] = [
    { id: '1', title: 'Item 1', description: 'Description 1' },
    { id: '2', title: 'Item 2', description: 'Description 2' },
    { id: '3', title: 'Item 3', description: 'Description 3' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentIndex).toBe(0);
    expect(component.borderRadius).toBe(BorderRadius.medium);
    expect(component.items).toEqual([]);
  });

  describe('ngOnChanges', () => {
    it('should merge config with defaults', () => {
      const customConfig = { showArrows: false };
      component.config = customConfig;
      component.ngOnChanges();

      expect(component.mergedConfig.showArrows).toBe(false);
      expect(component.mergedConfig.showDots).toBeDefined();
    });
  });

  describe('showArrows getter', () => {
    it('should return true when showArrows is enabled and has multiple items', () => {
      component.items = mockItems;
      component.mergedConfig = { ...component.mergedConfig, showArrows: true };

      expect(component.showArrows).toBe(true);
    });

    it('should return false when showArrows is disabled', () => {
      component.items = mockItems;
      component.mergedConfig = { ...component.mergedConfig, showArrows: false };

      expect(component.showArrows).toBe(false);
    });

    it('should return false when only one item', () => {
      component.items = [mockItems[0]];
      component.mergedConfig = { ...component.mergedConfig, showArrows: true };

      expect(component.showArrows).toBe(false);
    });
  });

  describe('showDots getter', () => {
    it('should return true when showDots is enabled and has multiple items', () => {
      component.items = mockItems;
      component.mergedConfig = { ...component.mergedConfig, showDots: true };

      expect(component.showDots).toBe(true);
    });

    it('should return false when showDots is disabled', () => {
      component.items = mockItems;
      component.mergedConfig = { ...component.mergedConfig, showDots: false };

      expect(component.showDots).toBe(false);
    });
  });

  describe('translateX getter', () => {
    it('should return correct transform value', () => {
      component.currentIndex = 2;
      expect(component.translateX).toBe('translateX(-200%)');
    });
  });

  describe('navigate', () => {
    beforeEach(() => {
      component.items = mockItems;
    });

    it('should navigate forward in bounded mode', () => {
      component.mergedConfig = { ...component.mergedConfig, navigationMode: CarouselNavigationMode.Bounded };
      component.currentIndex = 0;

      component.navigate(1);

      expect(component.currentIndex).toBe(1);
    });

    it('should navigate backward in bounded mode', () => {
      component.mergedConfig = { ...component.mergedConfig, navigationMode: CarouselNavigationMode.Bounded };
      component.currentIndex = 1;

      component.navigate(-1);

      expect(component.currentIndex).toBe(0);
    });

    it('should not navigate beyond bounds in bounded mode', () => {
      component.mergedConfig = { ...component.mergedConfig, navigationMode: CarouselNavigationMode.Bounded };
      component.currentIndex = 2;

      component.navigate(1);

      expect(component.currentIndex).toBe(2);
    });

    it('should loop to beginning when navigating forward from end in loop mode', () => {
      component.mergedConfig = { ...component.mergedConfig, navigationMode: CarouselNavigationMode.Loop };
      component.currentIndex = 2;

      component.navigate(1);

      expect(component.currentIndex).toBe(0);
    });

    it('should loop to end when navigating backward from beginning in loop mode', () => {
      component.mergedConfig = { ...component.mergedConfig, navigationMode: CarouselNavigationMode.Loop };
      component.currentIndex = 0;

      component.navigate(-1);

      expect(component.currentIndex).toBe(2);
    });
  });

  describe('canNavigate', () => {
    beforeEach(() => {
      component.items = mockItems;
    });

    it('should always return true in loop mode', () => {
      component.mergedConfig = { ...component.mergedConfig, navigationMode: CarouselNavigationMode.Loop };

      expect(component.canNavigate(1)).toBe(true);
      expect(component.canNavigate(-1)).toBe(true);
    });

    it('should return false when at beginning and trying to go backward in bounded mode', () => {
      component.mergedConfig = { ...component.mergedConfig, navigationMode: CarouselNavigationMode.Bounded };
      component.currentIndex = 0;

      expect(component.canNavigate(-1)).toBe(false);
    });

    it('should return false when at end and trying to go forward in bounded mode', () => {
      component.mergedConfig = { ...component.mergedConfig, navigationMode: CarouselNavigationMode.Bounded };
      component.currentIndex = 2;

      expect(component.canNavigate(1)).toBe(false);
    });
  });

  describe('goTo', () => {
    beforeEach(() => {
      component.items = mockItems;
    });

    it('should navigate to valid index', () => {
      component.goTo(1);

      expect(component.currentIndex).toBe(1);
    });

    it('should not navigate to invalid index', () => {
      component.currentIndex = 0;
      component.goTo(-1);

      expect(component.currentIndex).toBe(0);

      component.goTo(5);

      expect(component.currentIndex).toBe(0);
    });
  });

  describe('trackByFn', () => {
    it('should return item id when available', () => {
      const item = { id: 'test-id', title: 'test' };
      const result = component.trackByFn(0, item);

      expect(result).toBe('test-id');
    });

    it('should return index when id is not available', () => {
      const item = { title: 'test' } as CarouselItem;
      const result = component.trackByFn(2, item);

      expect(result).toBe(2);
    });
  });
});
