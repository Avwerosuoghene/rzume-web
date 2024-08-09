import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleSiginComponent } from './google-sigin.component';

describe('GoogleSiginComponent', () => {
  let component: GoogleSiginComponent;
  let fixture: ComponentFixture<GoogleSiginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleSiginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleSiginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
