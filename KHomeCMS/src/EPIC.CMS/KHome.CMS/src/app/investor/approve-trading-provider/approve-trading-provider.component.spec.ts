import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveTradingProviderComponent } from './approve-trading-provider.component';

describe('ApproveTradingProviderComponent', () => {
  let component: ApproveTradingProviderComponent;
  let fixture: ComponentFixture<ApproveTradingProviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveTradingProviderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveTradingProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
