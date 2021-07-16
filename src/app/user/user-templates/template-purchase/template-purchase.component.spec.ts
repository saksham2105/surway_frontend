import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatePurchaseComponent } from './template-purchase.component';

describe('TemplatePurchaseComponent', () => {
  let component: TemplatePurchaseComponent;
  let fixture: ComponentFixture<TemplatePurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplatePurchaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplatePurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
