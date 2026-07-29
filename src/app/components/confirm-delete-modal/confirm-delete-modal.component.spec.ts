import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDeleteModalComponent, ConfirmDeleteModalData } from './confirm-delete-modal.component';
import { DialogCloseStatus } from '../../core/models';

describe('ConfirmDeleteModalComponent', () => {
  let component: ConfirmDeleteModalComponent;
  let fixture: ComponentFixture<ConfirmDeleteModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmDeleteModalComponent>>;

  const mockData: ConfirmDeleteModalData = {
    title: 'Delete role?',
    message: 'This action cannot be undone.'
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ConfirmDeleteModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the injected dialog data', () => {
    expect(component.data).toEqual(mockData);
  });

  it('should render the title and message from the injected data', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain(mockData.title);
    expect(text).toContain(mockData.message);
  });

  it('should close the dialog with a Cancelled status and null data on onClose()', () => {
    component.onClose();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ status: DialogCloseStatus.Cancelled, data: null });
  });

  it('should close the dialog with a Submitted status and null data on onConfirm()', () => {
    component.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ status: DialogCloseStatus.Submitted, data: null });
  });
});
