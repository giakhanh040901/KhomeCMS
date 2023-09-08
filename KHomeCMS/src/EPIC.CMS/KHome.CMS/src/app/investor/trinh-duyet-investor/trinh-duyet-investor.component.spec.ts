import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrinhDuyetInvestorComponent } from './trinh-duyet-investor.component';

describe('TrinhDuyetInvestorComponent', () => {
  let component: TrinhDuyetInvestorComponent;
  let fixture: ComponentFixture<TrinhDuyetInvestorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrinhDuyetInvestorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrinhDuyetInvestorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
