import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import {  MatDialogModule } from '@angular/material/dialog';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';






import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loader: HarnessLoader;
    let router: Router;
  let harness: RouterTestingHarness;

  beforeEach(fakeAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [

        provideRouter([{ path: 'auth/signup', component: LoginComponent }]),

      ]

    })
    .compileComponents()
      .then(async () => {
        harness = await RouterTestingHarness.create();
      });

  }));


  beforeEach(fakeAsync(async () => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
    loader = TestbedHarnessEnvironment.loader(fixture);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
