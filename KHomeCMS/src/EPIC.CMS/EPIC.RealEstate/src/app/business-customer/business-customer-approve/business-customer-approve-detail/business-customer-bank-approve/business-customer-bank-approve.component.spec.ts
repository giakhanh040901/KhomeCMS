import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessCustomerBankApproveComponent } from './business-customer-bank-approve.component';

describe('BusinessCustomerBankApproveComponent', () => {
  let component: BusinessCustomerBankApproveComponent;
  let fixture: ComponentFixture<BusinessCustomerBankApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessCustomerBankApproveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessCustomerBankApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
