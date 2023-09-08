import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessCustomerComponent } from './business-customer.component';

describe('BusinessCustomerComponent', () => {
  let component: BusinessCustomerComponent;
  let fixture: ComponentFixture<BusinessCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
