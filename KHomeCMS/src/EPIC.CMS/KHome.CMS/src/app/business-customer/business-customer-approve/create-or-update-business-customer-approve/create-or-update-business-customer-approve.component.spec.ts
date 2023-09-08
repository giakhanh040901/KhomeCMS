import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrUpdateBusinessCustomerApproveComponent } from './create-or-update-business-customer-approve.component';

describe('CreateOrUpdateBusinessCustomerApproveComponent', () => {
  let component: CreateOrUpdateBusinessCustomerApproveComponent;
  let fixture: ComponentFixture<CreateOrUpdateBusinessCustomerApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOrUpdateBusinessCustomerApproveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrUpdateBusinessCustomerApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
