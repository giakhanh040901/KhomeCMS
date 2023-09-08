import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDigitalSignComponent } from './form-digital-sign.component';

describe('FormDigitalSignComponent', () => {
  let component: FormDigitalSignComponent;
  let fixture: ComponentFixture<FormDigitalSignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormDigitalSignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDigitalSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
