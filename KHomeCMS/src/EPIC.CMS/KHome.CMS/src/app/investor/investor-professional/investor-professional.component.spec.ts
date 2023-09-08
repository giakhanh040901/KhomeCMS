import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorProfessionalComponent } from './investor-professional.component';

describe('InvestorProfessionalComponent', () => {
  let component: InvestorProfessionalComponent;
  let fixture: ComponentFixture<InvestorProfessionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorProfessionalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorProfessionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
