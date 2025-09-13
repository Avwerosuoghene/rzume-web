import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EmptyStateComponent } from './empty-state.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent, MatButtonModule, MatIconModule]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title when provided', () => {
    component.title = 'Test Title';
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('.empty-state-title'));
    expect(titleElement?.nativeElement.textContent.trim()).toBe('Test Title');
  });

  it('should display message when provided', () => {
    component.message = 'Test Message';
    fixture.detectChanges();

    const messageElement = fixture.debugElement.query(By.css('.empty-state-message'));
    expect(messageElement?.nativeElement.textContent.trim()).toBe('Test Message');
  });

  it('should display icon when provided', () => {
    component.icon = 'test_icon';
    fixture.detectChanges();

    const iconElement = fixture.debugElement.query(By.css('mat-icon'));
    expect(iconElement?.nativeElement.textContent.trim()).toBe('test_icon');
  });

  it('should show action button when showAction is true', () => {
    component.showAction = true;
    component.actionText = 'Click Me';
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('button'));
    expect(buttonElement).toBeTruthy();
    expect(buttonElement.nativeElement.textContent.trim()).toBe('Click Me');
  });

  it('should hide action button when showAction is false', () => {
    component.showAction = false;
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('button'));
    expect(buttonElement).toBeFalsy();
  });

  it('should emit actionButtonClickedEvent when action button is clicked', () => {
    spyOn(component.actionButtonClickedEvent, 'emit');
    component.showAction = true;
    component.actionText = 'Click Me';
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('button'));
    buttonElement.nativeElement.click();

    expect(component.actionButtonClickedEvent.emit).toHaveBeenCalled();
  });

  it('should call actionButtonClicked when button is clicked', () => {
    spyOn(component, 'actionButtonClicked');
    component.showAction = true;
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('button'));
    buttonElement.nativeElement.click();

    expect(component.actionButtonClicked).toHaveBeenCalled();
  });

  it('should not display elements when inputs are undefined', () => {
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('.empty-state-title'));
    const messageElement = fixture.debugElement.query(By.css('.empty-state-message'));
    const iconElement = fixture.debugElement.query(By.css('mat-icon'));
    const buttonElement = fixture.debugElement.query(By.css('button'));

    expect(titleElement).toBeFalsy();
    expect(messageElement).toBeFalsy();
    expect(iconElement).toBeFalsy();
    expect(buttonElement).toBeFalsy();
  });
});
