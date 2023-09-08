import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrUpdateBussinessCustomerBankComponent } from './create-or-update-bussiness-customer-bank.component';

describe('CreateOrUpdateBussinessCustomerBankComponent', () => {
  let component: CreateOrUpdateBussinessCustomerBankComponent;
  let fixture: ComponentFixture<CreateOrUpdateBussinessCustomerBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOrUpdateBussinessCustomerBankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrUpdateBussinessCustomerBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
