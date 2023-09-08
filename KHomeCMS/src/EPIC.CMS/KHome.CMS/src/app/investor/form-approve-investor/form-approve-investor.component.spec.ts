import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormApproveInvestorComponent } from './form-approve-investor.component';

describe('FormApproveInvestorComponent', () => {
  let component: FormApproveInvestorComponent;
  let fixture: ComponentFixture<FormApproveInvestorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormApproveInvestorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormApproveInvestorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
