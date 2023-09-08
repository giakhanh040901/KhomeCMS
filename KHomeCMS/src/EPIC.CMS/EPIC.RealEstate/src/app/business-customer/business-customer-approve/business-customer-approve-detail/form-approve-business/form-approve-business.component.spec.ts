import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormApproveBusinessComponent } from './form-approve-business.component';

describe('FormApproveBusinessComponent', () => {
  let component: FormApproveBusinessComponent;
  let fixture: ComponentFixture<FormApproveBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormApproveBusinessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormApproveBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
