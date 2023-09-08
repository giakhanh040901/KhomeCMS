import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorSaleFilerComponent } from './investor-sale-filer.component';

describe('InvestorSaleFilerComponent', () => {
  let component: InvestorSaleFilerComponent;
  let fixture: ComponentFixture<InvestorSaleFilerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorSaleFilerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorSaleFilerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
