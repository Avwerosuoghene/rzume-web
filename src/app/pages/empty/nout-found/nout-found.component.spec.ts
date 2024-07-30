import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoutFoundComponent } from './nout-found.component';

describe('NoutFoundComponent', () => {
  let component: NoutFoundComponent;
  let fixture: ComponentFixture<NoutFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoutFoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoutFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
