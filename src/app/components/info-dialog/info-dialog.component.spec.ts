import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDialogComponent } from './info-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { InfoDialogData } from '../../core/models/interface/dialog-models';
import { IconStat } from '../../core/models/enums/shared.enums';

const data: InfoDialogData = {
  infoMessage: 'Mock message',
  statusIcon: IconStat.success
};

describe('InfoDialogComponent', () => {
  let component: InfoDialogComponent;
  let fixture: ComponentFixture<InfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoDialogComponent, MatDialogModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
