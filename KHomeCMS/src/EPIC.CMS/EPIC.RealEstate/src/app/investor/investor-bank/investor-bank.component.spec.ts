import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorBankComponent } from './investor-bank.component';

describe('InvestorBankComponent', () => {
  let component: InvestorBankComponent;
  let fixture: ComponentFixture<InvestorBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorBankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
