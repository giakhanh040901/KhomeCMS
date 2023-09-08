import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessCustomerBankComponent } from './business-customer-bank.component';

describe('BusinessCustomerBankComponent', () => {
  let component: BusinessCustomerBankComponent;
  let fixture: ComponentFixture<BusinessCustomerBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessCustomerBankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessCustomerBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
