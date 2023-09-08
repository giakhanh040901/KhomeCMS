import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorStockComponent } from './investor-stock.component';

describe('InvestorStockComponent', () => {
  let component: InvestorStockComponent;
  let fixture: ComponentFixture<InvestorStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorStockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
