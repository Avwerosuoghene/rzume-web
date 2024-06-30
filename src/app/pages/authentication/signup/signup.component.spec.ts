import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { SignupComponent } from './signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';




describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let loader: HarnessLoader;



  beforeEach(fakeAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule, MatDialogModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialog }
      ]
    })
      .compileComponents();

  }));

  beforeEach(fakeAsync(async () => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    flush();
  }));

  function generateValidFormData() {
    component.signupFormGroup.controls['email'].setValue('testuser@example.com');
    component.signupFormGroup.controls['password'].setValue('Str0ngP@ssword!');
  }

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a valid form when inputs are valid', () => {

    generateValidFormData();
    expect(component.signupFormGroup.valid).toBeTrue();
  });

  it('should have an invalid form when inputs are invalid', () => {
    component.signupFormGroup.controls['email'].setValue('');
    component.signupFormGroup.controls['password'].setValue('');
    expect(component.signupFormGroup.invalid).toBeTrue();
  });

  it('should display Signup text on the signup button', async () => {
    const signupButton = await loader.getHarness(MatButtonHarness.with({ selector: '#signupBtn' }));
    expect(signupButton.getText).toBe('Signup');
  });

  it('should expect Signup text button to be disabled when form is invalid', async () => {
    component.signupFormGroup.controls['email'].setValue('');
    component.signupFormGroup.controls['password'].setValue('');

    const signupButton = await loader.getHarness(MatButtonHarness.with({ selector: '#signupBtn' }));
    expect(await signupButton.isDisabled()).toBe(true);
  });

  it('should expect Signup text button to be enabled when form is valid', async () => {
    generateValidFormData();

    const signupButton = await loader.getHarness(MatButtonHarness.with({ selector: '#signupBtn' }));
    expect(await signupButton.isDisabled()).toBe(false);
  });

  it('should expect dialog to be closed by default', async () => {
    let dialogs = await TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(0);
  });

  it('should expect dialog to be opened when signup button is clicked and display a message', async () => {
    const signupButton = await loader.getHarness(MatButtonHarness.with({ selector: '#signupBtn' }));
    generateValidFormData();

    await signupButton.click();
    let dialogs = await TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);
    const dialogInstance = await dialogs[0].host();
    const dialogContent = await dialogInstance.getCssValue('.info-msg');
    expect(dialogContent.trim()).not.toBe('');
  });











});
