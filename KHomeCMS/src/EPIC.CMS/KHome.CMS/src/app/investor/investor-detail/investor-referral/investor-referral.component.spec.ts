import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorReferralComponent } from './investor-referral.component';

describe('InvestorReferralComponent', () => {
  let component: InvestorReferralComponent;
  let fixture: ComponentFixture<InvestorReferralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorReferralComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorReferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
