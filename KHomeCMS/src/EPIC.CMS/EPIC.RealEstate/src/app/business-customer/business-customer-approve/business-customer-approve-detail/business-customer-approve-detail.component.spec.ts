import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessCustomerApproveDetailComponent } from './business-customer-approve-detail.component';

describe('BusinessCustomerApproveDetailComponent', () => {
  let component: BusinessCustomerApproveDetailComponent;
  let fixture: ComponentFixture<BusinessCustomerApproveDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessCustomerApproveDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessCustomerApproveDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
