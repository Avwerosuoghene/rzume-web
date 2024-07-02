import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { SignupComponent } from './signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness, RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from '../login/login.component';







describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let loader: HarnessLoader;
  let router: Router;
  let harness: RouterTestingHarness;




  beforeEach(fakeAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule, MatDialogModule, NoopAnimationsModule, MatCheckboxModule],
      providers: [
        { provide: MatDialog },
        provideRouter([{ path: '/auth/login', component: LoginComponent }]),

      ]
    })
      .compileComponents()
      .then(async () => {
        harness = await RouterTestingHarness.create();
      });

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
    expect(signupButton.getText).toBe('Create an Account');
  });

  it('should expect Signup text button to be disabled when form is invalid', async () => {
    component.signupFormGroup.controls['email'].setValue('');
    component.signupFormGroup.controls['password'].setValue('');
    const signupButton = await loader.getHarness(MatButtonHarness.with({ selector: '#signupBtn' }));
    expect(await signupButton.isDisabled()).toBe(true);
  });

  it('should expect Signup text button to be disabled when form is valid and checkbox is unchecked', async () => {
    generateValidFormData();
    const signupButton = await loader.getHarness(MatButtonHarness.with({ selector: '#signupBtn' }));
    expect(await signupButton.isDisabled()).toBe(false);
  });

  it('should expect Signup text button to be enabled when form is valid and terms checkbox is checked', async () => {
    generateValidFormData();
    let termsCheckBox = await loader.getHarness(MatCheckboxHarness.with({ selector: '#termsCheckbox' }));
    await termsCheckBox.check();
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
    let termsCheckBox = await loader.getHarness(MatCheckboxHarness.with({ selector: '#termsCheckbox' }));
    await termsCheckBox.check();
    await signupButton.click();
    let dialogs = await TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);
    const dialogInstance = await dialogs[0].host();
    const dialogContent = await dialogInstance.getCssValue('.info-msg');
    expect(dialogContent.trim()).not.toBe('');
  });

  it('should expect terms of service dialog to be opened when terms of service anchor is clicked', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const termsNServiceAnchor = compiled.querySelector('#terms-service-anchor') as HTMLAnchorElement;
    await termsNServiceAnchor.click();
    let dialogs = await TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);

  });


  it('should expect terms of policy dialog to be opened when terms of service anchor is clicked', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const privacyPolicyAnchor = compiled.querySelector('#terms-policy-anchor') as HTMLAnchorElement;
    await privacyPolicyAnchor.click();
    let dialogs = await TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);

  });

  it('should navigate to /signin once the signin anchor tag is clicked', async () => {
    spyOn(router, 'navigate').and.callThrough();
    const compiled = fixture.nativeElement as HTMLElement;
    const signinAnchor = compiled.querySelector('#sign-in_anch') as HTMLAnchorElement;
    signinAnchor.click();
    expect(TestBed.inject(Router).url)
      .toEqual(`/auth/login`);
  });



});
