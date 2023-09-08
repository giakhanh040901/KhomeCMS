import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorRequestPhoneComponent } from './investor-request-phone.component';

describe('InvestorRequestPhoneComponent', () => {
  let component: InvestorRequestPhoneComponent;
  let fixture: ComponentFixture<InvestorRequestPhoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorRequestPhoneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorRequestPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
