import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusiCusApproveLicenseFileComponent } from './busi-cus-approve-license-file.component';

describe('BusiCusApproveLicenseFileComponent', () => {
  let component: BusiCusApproveLicenseFileComponent;
  let fixture: ComponentFixture<BusiCusApproveLicenseFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusiCusApproveLicenseFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusiCusApproveLicenseFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
