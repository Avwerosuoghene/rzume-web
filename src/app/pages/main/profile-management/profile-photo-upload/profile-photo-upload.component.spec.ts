import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilePhotoUploadComponent } from './profile-photo-upload.component';
import { DEFAULT_PROFILE_IMAGE } from '../../../../core/models';

describe('ProfilePhotoUploadComponent', () => {
  let component: ProfilePhotoUploadComponent;
  let fixture: ComponentFixture<ProfilePhotoUploadComponent>;

  function fileSelectEvent(file: File): Event {
    const input = document.createElement('input');
    input.type = 'file';
    spyOnProperty(input, 'files', 'get').and.returnValue({
      0: file,
      length: 1,
      item: (i: number) => (i === 0 ? file : null),
      [Symbol.iterator]: function* () { yield file; }
    } as unknown as FileList);
    return { target: input } as unknown as Event;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePhotoUploadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePhotoUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('displayPhotoUrl', () => {
    it('should fall back to the default profile image when no photoUrl is set', () => {
      expect(component.displayPhotoUrl).toBe(DEFAULT_PROFILE_IMAGE);
    });

    it('should use the provided photoUrl when set', () => {
      component.photoUrl = 'http://example.com/photo.jpg';
      expect(component.displayPhotoUrl).toBe('http://example.com/photo.jpg');
    });
  });

  describe('onFileSelected', () => {
    it('should emit a valid image file and clear any error message', () => {
      const spy = jasmine.createSpy('photoSelected');
      component.photoSelected.subscribe(spy);
      const file = new File(['a'], 'photo.png', { type: 'image/png' });

      component.onFileSelected(fileSelectEvent(file));

      expect(spy).toHaveBeenCalledWith(file);
      expect(component.errorMessage).toBe('');
    });

    it('should reject a file that is too large and show an error, without emitting', () => {
      const spy = jasmine.createSpy('photoSelected');
      component.photoSelected.subscribe(spy);
      const file = new File([new Uint8Array(2 * 1024 * 1024)], 'big.png', { type: 'image/png' });

      component.onFileSelected(fileSelectEvent(file));

      expect(spy).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('File size must not exceed 1MB');
    });

    it('should reject a disallowed file type and show an error, without emitting', () => {
      const spy = jasmine.createSpy('photoSelected');
      component.photoSelected.subscribe(spy);
      const file = new File(['a'], 'photo.gif', { type: 'image/gif' });

      component.onFileSelected(fileSelectEvent(file));

      expect(spy).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Only JPEG, PNG, and WebP images are allowed');
    });

    it('should clear a previous error message when a subsequent file is valid', () => {
      const invalidFile = new File(['a'], 'photo.gif', { type: 'image/gif' });
      component.onFileSelected(fileSelectEvent(invalidFile));
      expect(component.errorMessage).not.toBe('');

      const validFile = new File(['a'], 'photo.png', { type: 'image/png' });
      component.onFileSelected(fileSelectEvent(validFile));

      expect(component.errorMessage).toBe('');
    });

    it('should do nothing when no file is present on the input', () => {
      const spy = jasmine.createSpy('photoSelected');
      component.photoSelected.subscribe(spy);
      const input = document.createElement('input');
      input.type = 'file';

      component.onFileSelected({ target: input } as unknown as Event);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('triggerFileInput', () => {
    it('should click the hidden file input', () => {
      const clickSpy = spyOn(HTMLInputElement.prototype, 'click');
      component.triggerFileInput();
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
