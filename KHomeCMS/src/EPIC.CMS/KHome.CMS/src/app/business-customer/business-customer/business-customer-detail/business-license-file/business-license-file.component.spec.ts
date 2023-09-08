import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessLicenseFileComponent } from './business-license-file.component';

describe('BusinessLicenseFileComponent', () => {
  let component: BusinessLicenseFileComponent;
  let fixture: ComponentFixture<BusinessLicenseFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessLicenseFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessLicenseFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
