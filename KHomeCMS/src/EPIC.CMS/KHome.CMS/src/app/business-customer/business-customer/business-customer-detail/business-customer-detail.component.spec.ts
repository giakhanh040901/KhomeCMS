import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessCustomerDetailComponent } from './business-customer-detail.component';

describe('BusinessCustomerDetailComponent', () => {
  let component: BusinessCustomerDetailComponent;
  let fixture: ComponentFixture<BusinessCustomerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessCustomerDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessCustomerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
