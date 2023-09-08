import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorContactAddressComponent } from './investor-contact-address.component';

describe('InvestorContactAddressComponent', () => {
  let component: InvestorContactAddressComponent;
  let fixture: ComponentFixture<InvestorContactAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorContactAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorContactAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
