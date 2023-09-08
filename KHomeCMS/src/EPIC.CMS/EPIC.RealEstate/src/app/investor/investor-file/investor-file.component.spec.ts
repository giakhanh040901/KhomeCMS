import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorFileComponent } from './investor-file.component';

describe('InvestorFileComponent', () => {
  let component: InvestorFileComponent;
  let fixture: ComponentFixture<InvestorFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestorFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
