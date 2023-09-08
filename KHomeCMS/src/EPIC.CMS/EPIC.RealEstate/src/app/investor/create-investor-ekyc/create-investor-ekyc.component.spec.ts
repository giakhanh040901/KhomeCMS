import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInvestorEkycComponent } from './create-investor-ekyc.component';

describe('CreateInvestorEkycComponent', () => {
  let component: CreateInvestorEkycComponent;
  let fixture: ComponentFixture<CreateInvestorEkycComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateInvestorEkycComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateInvestorEkycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
