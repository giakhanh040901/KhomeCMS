import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormShowChangeComponent } from './form-show-change.component';

describe('FormShowChangeComponent', () => {
  let component: FormShowChangeComponent;
  let fixture: ComponentFixture<FormShowChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormShowChangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormShowChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
