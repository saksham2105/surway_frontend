import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyShareComponent } from './survey-share.component';

describe('SurveyShareComponent', () => {
  let component: SurveyShareComponent;
  let fixture: ComponentFixture<SurveyShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyShareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
