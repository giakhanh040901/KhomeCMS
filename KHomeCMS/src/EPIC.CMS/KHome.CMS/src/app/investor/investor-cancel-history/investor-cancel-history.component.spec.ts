import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorCancelHistoryComponent } from './investor-cancel-history.component';

describe('InvestorCancelHistoryComponent', () => {
  let component: InvestorCancelHistoryComponent;
  let fixture: ComponentFixture<InvestorCancelHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorCancelHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorCancelHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
