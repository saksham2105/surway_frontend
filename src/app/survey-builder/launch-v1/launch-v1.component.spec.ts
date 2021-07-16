import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchV1Component } from './launch-v1.component';

describe('LaunchV1Component', () => {
  let component: LaunchV1Component;
  let fixture: ComponentFixture<LaunchV1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaunchV1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
