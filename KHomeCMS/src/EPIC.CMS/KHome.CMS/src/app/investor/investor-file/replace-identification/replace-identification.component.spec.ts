import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceIdentificationComponent } from './replace-identification.component';

describe('ReplaceIdentificationComponent', () => {
  let component: ReplaceIdentificationComponent;
  let fixture: ComponentFixture<ReplaceIdentificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReplaceIdentificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceIdentificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
