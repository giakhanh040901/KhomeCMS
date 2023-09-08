import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorSaleComponent } from './investor-sale.component';

describe('InvestorSaleComponent', () => {
  let component: InvestorSaleComponent;
  let fixture: ComponentFixture<InvestorSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorSaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
