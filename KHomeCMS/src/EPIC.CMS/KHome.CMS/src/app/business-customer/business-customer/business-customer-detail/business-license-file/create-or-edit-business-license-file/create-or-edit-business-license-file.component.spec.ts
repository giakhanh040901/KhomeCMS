import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrEditBusinessLicenseFileComponent } from './create-or-edit-business-license-file.component';

describe('CreateOrEditBusinessLicenseFileComponent', () => {
  let component: CreateOrEditBusinessLicenseFileComponent;
  let fixture: ComponentFixture<CreateOrEditBusinessLicenseFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOrEditBusinessLicenseFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrEditBusinessLicenseFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
