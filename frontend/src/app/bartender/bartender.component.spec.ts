import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BartenderComponent } from './bartender.component';

describe('BartenderComponent', () => {
  let component: BartenderComponent;
  let fixture: ComponentFixture<BartenderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BartenderComponent]
    });
    fixture = TestBed.createComponent(BartenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
