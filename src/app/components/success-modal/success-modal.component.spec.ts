import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SuccessModalComponent, SuccessModalData } from './success-modal.component';
import { DialogCloseStatus } from '../../core/models/enums/dialog.enums';

describe('SuccessModalComponent', () => {
  let component: SuccessModalComponent;
  let fixture: ComponentFixture<SuccessModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SuccessModalComponent>>;

  const mockData: SuccessModalData = {
    title: 'Application added',
    message: 'Your job application was saved successfully.'
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SuccessModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessModalComponent);
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

  it('should close the dialog with a Submitted status and null data on onClose()', () => {
    component.onClose();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ status: DialogCloseStatus.Submitted, data: null });
  });
});
