import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorDiffComponent } from './investor-diff.component';

describe('InvestorDiffComponent', () => {
  let component: InvestorDiffComponent;
  let fixture: ComponentFixture<InvestorDiffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorDiffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorDiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
