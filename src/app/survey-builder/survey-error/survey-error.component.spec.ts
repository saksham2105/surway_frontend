import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyErrorComponent } from './survey-error.component';

describe('SurveyErrorComponent', () => {
  let component: SurveyErrorComponent;
  let fixture: ComponentFixture<SurveyErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
