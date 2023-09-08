import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessCustomerDigitalSignComponent } from './business-customer-digital-sign.component';

describe('BusinessCustomerDigitalSignComponent', () => {
  let component: BusinessCustomerDigitalSignComponent;
  let fixture: ComponentFixture<BusinessCustomerDigitalSignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessCustomerDigitalSignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessCustomerDigitalSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
