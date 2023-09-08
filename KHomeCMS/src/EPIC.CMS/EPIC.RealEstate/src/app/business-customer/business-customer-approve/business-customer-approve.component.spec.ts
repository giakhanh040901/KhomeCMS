import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessCustomerApproveComponent } from './business-customer-approve.component';

describe('BusinessCustomerApproveComponent', () => {
  let component: BusinessCustomerApproveComponent;
  let fixture: ComponentFixture<BusinessCustomerApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessCustomerApproveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessCustomerApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
