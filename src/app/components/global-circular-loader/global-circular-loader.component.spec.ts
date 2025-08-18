import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalCircularLoaderComponent } from './global-circular-loader.component';

describe('GlobalCircularLoaderComponent', () => {
  let component: GlobalCircularLoaderComponent;
  let fixture: ComponentFixture<GlobalCircularLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalCircularLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalCircularLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
