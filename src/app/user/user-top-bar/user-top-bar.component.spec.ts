import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTopBarComponent } from './user-top-bar.component';

describe('UserTopBarComponent', () => {
  let component: UserTopBarComponent;
  let fixture: ComponentFixture<UserTopBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserTopBarComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
