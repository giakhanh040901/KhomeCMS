import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInvestorSaleComponent } from './add-investor-sale.component';

describe('AddInvestorSaleComponent', () => {
  let component: AddInvestorSaleComponent;
  let fixture: ComponentFixture<AddInvestorSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddInvestorSaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInvestorSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
