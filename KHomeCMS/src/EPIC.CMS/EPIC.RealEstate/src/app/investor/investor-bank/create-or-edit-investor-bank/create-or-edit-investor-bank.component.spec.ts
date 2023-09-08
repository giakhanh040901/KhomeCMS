import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrEditInvestorBankComponent } from './create-or-edit-investor-bank.component';

describe('CreateOrEditInvestorBankComponent', () => {
  let component: CreateOrEditInvestorBankComponent;
  let fixture: ComponentFixture<CreateOrEditInvestorBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOrEditInvestorBankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrEditInvestorBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
