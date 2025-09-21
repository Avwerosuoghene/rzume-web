import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';

import { CustomTableComponent } from './custom-table.component';
import { DialogHelperService } from '../../core/services/dialog-helper.service';

describe('CustomTableComponent', () => {
  let component: CustomTableComponent;
  let fixture: ComponentFixture<CustomTableComponent>;

  beforeEach(async () => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const dialogHelperSpy = jasmine.createSpyObj('DialogHelperService', ['openInfoDialog']);

    await TestBed.configureTestingModule({
      imports: [CustomTableComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: DialogHelperService, useValue: dialogHelperSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
