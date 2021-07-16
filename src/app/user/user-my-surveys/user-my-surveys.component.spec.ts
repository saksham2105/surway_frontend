import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMySurveysComponent } from './user-my-surveys.component';

describe('UserMySurveysComponent', () => {
  let component: UserMySurveysComponent;
  let fixture: ComponentFixture<UserMySurveysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserMySurveysComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMySurveysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
