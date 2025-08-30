import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePagintionComponent } from './table-pagintion.component';

describe('TablePagintionComponent', () => {
  let component: TablePagintionComponent;
  let fixture: ComponentFixture<TablePagintionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablePagintionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablePagintionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
