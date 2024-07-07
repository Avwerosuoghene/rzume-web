import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDialogComponent } from './info-dialog.component';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogHarness } from '@angular/material/dialog/testing';

describe('InfoDialogComponent', () => {
  let component: InfoDialogComponent;
  let fixture: ComponentFixture<InfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoDialogComponent, TestbedHarnessEnvironment, MatDialogModule, MatDialogHarness]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expect dialog message to not be empty', async () => {
    const message = fixture.nativeElement.querySelector('#info-message');
    expect(message.textContent.trim()).not.toBe('');
  });
});
