import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PolicyDialogComponent } from './policy-dialog.component';
import { PolicyDialogData } from '../../core/models/interface/dialog-models';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';

describe('PolicyDialogComponent', () => {
  let component: PolicyDialogComponent;
  let fixture: ComponentFixture<PolicyDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<PolicyDialogComponent>>;

  const mockDialogData: PolicyDialogData = {
    title: 'Test Policy',
    content: 'This is a test policy content with some **bold** text and a [link](https://example.com).'
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        PolicyDialogComponent,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject dialog data correctly', () => {
    expect(component.data.title).toBe('Test Policy');
    expect(component.data.content).toContain('test policy content');
  });

  it('should display the policy title in the header', () => {
    const titleElement = fixture.nativeElement.querySelector('.policy-dialog-title');
    expect(titleElement.textContent).toContain('Test Policy');
  });

  it('should display the policy content in the content area', () => {
    const contentElement = fixture.nativeElement.querySelector('.policy-content-text');
    expect(contentElement.innerHTML).toContain('test policy content');
    expect(contentElement.innerHTML).toContain('<strong>bold</strong>');
    expect(contentElement.innerHTML).toContain('<a href="https://example.com">link</a>');
  });

  it('should have a close button in the header', () => {
    const closeButton = fixture.nativeElement.querySelector('.close-button');
    expect(closeButton).toBeTruthy();
    expect(closeButton.getAttribute('aria-label')).toBe('Close dialog');
  });

  it('should have a confirm button in the actions area', () => {
    const confirmButton = fixture.nativeElement.querySelector('.confirm-button');
    expect(confirmButton).toBeTruthy();
    expect(confirmButton.textContent).toContain('I Understand');
  });

  it('should close dialog with cancelled status when close button is clicked', () => {
    const closeButton = fixture.nativeElement.querySelector('.close-button');
    closeButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      status: DialogCloseStatus.Cancelled
    });
  });

  it('should close dialog with cancelled status when confirm button is clicked', () => {
    const confirmButton = fixture.nativeElement.querySelector('.confirm-button');
    confirmButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      status: DialogCloseStatus.Cancelled
    });
  });

  it('should have proper CSS classes applied', () => {
    const container = fixture.nativeElement.querySelector('.policy-dialog-container');
    expect(container).toBeTruthy();

    const header = fixture.nativeElement.querySelector('.policy-dialog-header');
    expect(header).toBeTruthy();

    const content = fixture.nativeElement.querySelector('.policy-dialog-content');
    expect(content).toBeTruthy();

    const actions = fixture.nativeElement.querySelector('.policy-dialog-actions');
    expect(actions).toBeTruthy();
  });

  it('should handle empty content gracefully', () => {
    TestBed.resetTestingModule();
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [
        PolicyDialogComponent,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Empty', content: '' } },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const contentElement = fixture.nativeElement.querySelector('.policy-content-text');
    expect(contentElement.innerHTML).toBe('');
  });

  it('should handle long content with scrollable viewport', () => {
    const longContent = 'Line 1\n'.repeat(100); // Create long content
    TestBed.resetTestingModule();
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [
        PolicyDialogComponent,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Long Policy', content: longContent } },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const scrollViewport = fixture.nativeElement.querySelector('.policy-scroll-viewport');
    expect(scrollViewport).toBeTruthy();
  });
});
