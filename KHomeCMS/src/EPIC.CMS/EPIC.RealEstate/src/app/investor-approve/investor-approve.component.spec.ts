import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorApproveComponent } from './investor-approve.component';

describe('InvestorApproveComponent', () => {
  let component: InvestorApproveComponent;
  let fixture: ComponentFixture<InvestorApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorApproveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
