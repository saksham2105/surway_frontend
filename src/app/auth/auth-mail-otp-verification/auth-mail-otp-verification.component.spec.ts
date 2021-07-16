import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthMailOtpVerificationComponent } from './auth-mail-otp-verification.component';

describe('AuthMailOtpVerificationComponent', () => {
  let component: AuthMailOtpVerificationComponent;
  let fixture: ComponentFixture<AuthMailOtpVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthMailOtpVerificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthMailOtpVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
